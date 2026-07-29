"use client";

/**
 * Core audio/video engine. Every operation shells out to a real ffmpeg
 * binary compiled to WASM (via @ffmpeg/ffmpeg) — the same command-line
 * tool used by professional video pipelines — so behavior matches
 * desktop ffmpeg exactly, not an approximation.
 */
import { fetchFile } from "@ffmpeg/util";
import { getFFmpeg } from "./ffmpeg-loader";

const AUDIO_CODEC_FOR_EXT = {
  mp3: ["-c:a", "libmp3lame", "-b:a", "192k"],
  wav: ["-c:a", "pcm_s16le"],
  aac: ["-c:a", "aac", "-b:a", "192k"],
  m4a: ["-c:a", "aac", "-b:a", "192k"],
  flac: ["-c:a", "flac"],
  ogg: ["-c:a", "libvorbis", "-q:a", "5"],
  aiff: ["-c:a", "pcm_s16le"],
  amr: ["-c:a", "libopencore_amrnb", "-ar", "8000", "-ac", "1"],
};

// Per-container: fixed video codec args, plus which SOURCE audio codecs
// that container can hold via `-c:a copy` (no re-encode) instead of a
// fresh transcode. See the `-c:a copy` deadlock workaround in
// convertVideo below for why this table exists — copyCompatibleAudio
// lists container-format facts (which audio codecs a container can
// legally hold as-is), not a guess; keep this conservative (only
// well-established, broadly-supported combinations) since a rejected
// copy attempt would surface as a new, different visible error.
const VIDEO_CODEC_FOR_EXT = {
  mp4: {
    videoArgs: ["-c:v", "libx264", "-preset", "veryfast", "-crf", "23"],
    transcodeAudioArgs: ["-c:a", "aac"],
    copyCompatibleAudio: ["aac"],
  },
  webm: {
    videoArgs: ["-c:v", "libvpx-vp9", "-crf", "32", "-b:v", "0"],
    transcodeAudioArgs: ["-c:a", "libopus"],
    copyCompatibleAudio: ["opus", "vorbis"],
  },
  avi: {
    videoArgs: ["-c:v", "mpeg4", "-q:v", "5"],
    transcodeAudioArgs: ["-c:a", "libmp3lame"],
    copyCompatibleAudio: ["mp3"],
  },
  mov: {
    videoArgs: ["-c:v", "libx264", "-preset", "veryfast", "-crf", "23"],
    transcodeAudioArgs: ["-c:a", "aac"],
    copyCompatibleAudio: ["aac"],
  },
  mkv: {
    videoArgs: ["-c:v", "libx264", "-preset", "veryfast", "-crf", "23"],
    transcodeAudioArgs: ["-c:a", "aac"],
    copyCompatibleAudio: ["aac"],
  },
  gif: { videoArgs: [], transcodeAudioArgs: [], copyCompatibleAudio: [] },
};

async function withFFmpeg(inputFile, inputName, run, onProgress) {
  const ffmpeg = await getFFmpeg();
  const progressHandler = ({ progress }) => onProgress?.(Math.min(Math.max(progress, 0), 1));
  ffmpeg.on("progress", progressHandler);

  try {
    await ffmpeg.writeFile(inputName, await fetchFile(inputFile));
    return await run(ffmpeg);
  } finally {
    ffmpeg.off("progress", progressHandler);
  }
}

async function readAndCleanup(ffmpeg, outputName, mimeType, filesToDelete) {
  const data = await ffmpeg.readFile(outputName);
  for (const f of filesToDelete) {
    try {
      await ffmpeg.deleteFile(f);
    } catch {
      // best-effort cleanup — a missing temp file is not an error condition
    }
  }
  return new Blob([data.buffer], { type: mimeType });
}

/**
 * Returns the input file's first audio stream's codec name (e.g. "aac",
 * "opus", "mp3"), or null if it has no audio stream, or if the probe
 * itself fails for any reason (corrupt/unusual file, unexpected
 * ffprobe output). null is treated by callers as "unknown/absent" —
 * safe to fall through to re-encoding audio as before, never treated
 * as a reason to skip the whole conversion.
 */
async function probeAudioCodec(ffmpeg, inputName) {
  const probeOut = "probe.txt";
  try {
    await ffmpeg.ffprobe([
      "-v", "error",
      "-show_entries", "stream=codec_name",
      "-select_streams", "a:0",
      "-of", "default=noprint_wrappers=1:nokey=1",
      inputName,
      "-o", probeOut,
    ]);
    const data = await ffmpeg.readFile(probeOut);
    const text = new TextDecoder().decode(data).trim();
    return text || null; // empty output = no audio stream
  } catch {
    return null; // probe failed — caller falls back to re-encoding, the pre-existing behavior
  } finally {
    try {
      await ffmpeg.deleteFile(probeOut);
    } catch {
      // best-effort cleanup — a missing temp file is not an error condition
    }
  }
}

function extOf(name) {
  return (name.split(".").pop() || "").toLowerCase();
}

/** Convert audio between formats. */
export async function convertAudio(file, targetExt, onProgress) {
  const inputName = `input.${extOf(file.name) || "audio"}`;
  const outputName = `output.${targetExt}`;
  const codecArgs = AUDIO_CODEC_FOR_EXT[targetExt] || [];

  return withFFmpeg(
    file,
    inputName,
    async (ffmpeg) => {
      await ffmpeg.exec(["-i", inputName, ...codecArgs, outputName]);
      return readAndCleanup(ffmpeg, outputName, `audio/${targetExt}`, [inputName, outputName]);
    },
    onProgress
  );
}

/** Convert video between formats, including animated GIF. */
export async function convertVideo(file, targetExt, onProgress) {
  const inputName = `input.${extOf(file.name) || "video"}`;
  const outputName = `output.${targetExt}`;

  return withFFmpeg(
    file,
    inputName,
    async (ffmpeg) => {
      if (targetExt === "gif") {
        await ffmpeg.exec(["-i", inputName, "-vf", "fps=12,scale=480:-1:flags=lanczos,palettegen", "palette.png"]);
        await ffmpeg.exec([
          "-i", inputName,
          "-i", "palette.png",
          "-lavfi", "fps=12,scale=480:-1:flags=lanczos[x];[x][1:v]paletteuse",
          outputName,
        ]);
        return readAndCleanup(ffmpeg, outputName, "image/gif", [inputName, outputName, "palette.png"]);
      }
      const { videoArgs = [], transcodeAudioArgs = [], copyCompatibleAudio = [] } =
        VIDEO_CODEC_FOR_EXT[targetExt] || {};

      // IMPORTANT — works around a confirmed, still-open @ffmpeg/ffmpeg
      // bug (core-mt v0.12.x on Chromium/Safari; see
      // https://github.com/ffmpegwasm/ffmpeg.wasm/issues/772): a single
      // exec() that re-encodes BOTH video (libx264/libvpx-vp9/mpeg4) AND
      // audio (aac/libopus/libmp3lame) at once deadlocks the WASM
      // pthread pool — exec() never resolves or rejects, never logs
      // anything further, and the UI is stuck with no error. Confirmed
      // by many independent reports in that thread; Firefox and the
      // single-threaded core are unaffected, only Chromium/Safari + MT.
      //
      // The reported, repeatedly-verified fix is to avoid a codec
      // *change* on the audio stream within that same call — passing
      // `-c:a copy` (no re-encode) sidesteps the deadlock even though
      // the video encoder is still doing real work. So: probe the
      // source's actual audio codec, and use `-c:a copy` whenever the
      // target container can legally hold that codec as-is. Only fall
      // back to a real audio transcode (the original, pre-fix behavior)
      // when copy genuinely isn't possible — a different source codec,
      // or no audio stream at all.
      const sourceAudioCodec = await probeAudioCodec(ffmpeg, inputName);
      const audioArgs =
        sourceAudioCodec && copyCompatibleAudio.includes(sourceAudioCodec)
          ? ["-c:a", "copy"]
          : transcodeAudioArgs;

      await ffmpeg.exec(["-i", inputName, ...videoArgs, ...audioArgs, outputName]);
      return readAndCleanup(ffmpeg, outputName, `video/${targetExt}`, [inputName, outputName]);
    },
    onProgress
  );
}

/** Trim audio or video to [startSec, endSec]. */
export async function trimMedia(file, startSec, endSec, isVideo, onProgress) {
  const ext = extOf(file.name);
  const inputName = `input.${ext}`;
  const outputName = `output.${ext}`;
  const duration = endSec - startSec;

  return withFFmpeg(
    file,
    inputName,
    async (ffmpeg) => {
      await ffmpeg.exec(["-i", inputName, "-ss", String(startSec), "-t", String(duration), "-c", "copy", outputName]);
      return readAndCleanup(ffmpeg, outputName, isVideo ? `video/${ext}` : `audio/${ext}`, [inputName, outputName]);
    },
    onProgress
  );
}

/** Merge multiple audio files (same format) into one continuous track. */
export async function mergeAudio(files, onProgress) {
  const ext = extOf(files[0].name) || "mp3";
  const inputNames = files.map((_, i) => `input${i}.${ext}`);
  const outputName = `output.${ext}`;

  const ffmpeg = await getFFmpeg();
  const progressHandler = ({ progress }) => onProgress?.(Math.min(Math.max(progress, 0), 1));
  ffmpeg.on("progress", progressHandler);

  try {
    for (let i = 0; i < files.length; i++) {
      await ffmpeg.writeFile(inputNames[i], await fetchFile(files[i]));
    }
    const listContent = inputNames.map((n) => `file '${n}'`).join("\n");
    await ffmpeg.writeFile("list.txt", listContent);
    await ffmpeg.exec(["-f", "concat", "-safe", "0", "-i", "list.txt", "-c", "copy", outputName]);
    return await readAndCleanup(ffmpeg, outputName, `audio/${ext}`, [...inputNames, "list.txt", outputName]);
  } finally {
    ffmpeg.off("progress", progressHandler);
  }
}

/** Split one audio file into segments at the given timestamps (seconds). */
export async function splitAudio(file, timestamps, onProgress) {
  const ext = extOf(file.name);
  const inputName = `input.${ext}`;
  const ffmpeg = await getFFmpeg();
  const outputs = [];

  await ffmpeg.writeFile(inputName, await fetchFile(file));
  const bounds = [0, ...timestamps];

  for (let i = 0; i < bounds.length; i++) {
    const start = bounds[i];
    const outputName = `segment-${i + 1}.${ext}`;
    const args = ["-i", inputName, "-ss", String(start)];
    if (i < bounds.length - 1) args.push("-t", String(bounds[i + 1] - start));
    args.push("-c", "copy", outputName);
    await ffmpeg.exec(args);
    const data = await ffmpeg.readFile(outputName);
    outputs.push({ blob: new Blob([data.buffer], { type: `audio/${ext}` }), name: `segment-${i + 1}.${ext}` });
    await ffmpeg.deleteFile(outputName);
    onProgress?.((i + 1) / bounds.length);
  }
  await ffmpeg.deleteFile(inputName);
  return outputs;
}

/** Normalize audio loudness to a target LUFS using ffmpeg's real loudnorm filter. */
export async function normalizeAudio(file, targetLufs = -16, onProgress) {
  const ext = extOf(file.name);
  const inputName = `input.${ext}`;
  const outputName = `output.${ext}`;

  return withFFmpeg(
    file,
    inputName,
    async (ffmpeg) => {
      await ffmpeg.exec(["-i", inputName, "-af", `loudnorm=I=${targetLufs}:TP=-1.5:LRA=11`, outputName]);
      return readAndCleanup(ffmpeg, outputName, `audio/${ext}`, [inputName, outputName]);
    },
    onProgress
  );
}

/** Extract just the audio track from a video file. */
export async function extractAudioFromVideo(file, targetExt = "mp3", onProgress) {
  const inputName = `input.${extOf(file.name)}`;
  const outputName = `output.${targetExt}`;
  const codecArgs = AUDIO_CODEC_FOR_EXT[targetExt] || [];

  return withFFmpeg(
    file,
    inputName,
    async (ffmpeg) => {
      await ffmpeg.exec(["-i", inputName, "-vn", ...codecArgs, outputName]);
      return readAndCleanup(ffmpeg, outputName, `audio/${targetExt}`, [inputName, outputName]);
    },
    onProgress
  );
}

/** Compress video to a target quality preset via CRF (constant rate factor). */
export async function compressVideo(file, level = "medium", onProgress) {
  const ext = extOf(file.name) || "mp4";
  const inputName = `input.${ext}`;
  const outputName = `output.${ext}`;
  const crf = { low: 30, medium: 26, high: 20 }[level] ?? 26;

  return withFFmpeg(
    file,
    inputName,
    async (ffmpeg) => {
      // Same core-mt deadlock and same fix as convertVideo above: probe
      // first, copy the audio stream instead of re-encoding it whenever
      // possible. compressVideo keeps the source's own container/ext, so
      // "compatible" here just means "already AAC" for the common
      // mp4/mov/mkv case this tool is built around.
      const sourceAudioCodec = await probeAudioCodec(ffmpeg, inputName);
      const audioArgs =
        sourceAudioCodec === "aac" ? ["-c:a", "copy"] : ["-c:a", "aac", "-b:a", "128k"];

      await ffmpeg.exec([
        "-i", inputName,
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-crf", String(crf),
        ...audioArgs,
        outputName,
      ]);
      return readAndCleanup(ffmpeg, outputName, `video/${ext}`, [inputName, outputName]);
    },
    onProgress
  );
}

/** Resize video to explicit dimensions (use -1 for either to preserve aspect ratio). */
export async function resizeVideo(file, width, height, onProgress) {
  const ext = extOf(file.name) || "mp4";
  const inputName = `input.${ext}`;
  const outputName = `output.${ext}`;

  return withFFmpeg(
    file,
    inputName,
    async (ffmpeg) => {
      await ffmpeg.exec(["-i", inputName, "-vf", `scale=${width}:${height}:flags=lanczos`, "-c:a", "copy", outputName]);
      return readAndCleanup(ffmpeg, outputName, `video/${ext}`, [inputName, outputName]);
    },
    onProgress
  );
}

/** Crop video to a pixel region. */
export async function cropVideo(file, cropBox, onProgress) {
  const ext = extOf(file.name) || "mp4";
  const inputName = `input.${ext}`;
  const outputName = `output.${ext}`;

  return withFFmpeg(
    file,
    inputName,
    async (ffmpeg) => {
      await ffmpeg.exec([
        "-i", inputName,
        "-vf", `crop=${cropBox.width}:${cropBox.height}:${cropBox.x}:${cropBox.y}`,
        "-c:a", "copy",
        outputName,
      ]);
      return readAndCleanup(ffmpeg, outputName, `video/${ext}`, [inputName, outputName]);
    },
    onProgress
  );
}

/** Change video frame rate. */
export async function changeVideoFps(file, targetFps, onProgress) {
  const ext = extOf(file.name) || "mp4";
  const inputName = `input.${ext}`;
  const outputName = `output.${ext}`;

  return withFFmpeg(
    file,
    inputName,
    async (ffmpeg) => {
      await ffmpeg.exec(["-i", inputName, "-r", String(targetFps), "-c:a", "copy", outputName]);
      return readAndCleanup(ffmpeg, outputName, `video/${ext}`, [inputName, outputName]);
    },
    onProgress
  );
}

/** Rotate video in 90-degree increments (0/90/180/270). */
export async function rotateVideo(file, degreesVal, onProgress) {
  const ext = extOf(file.name) || "mp4";
  const inputName = `input.${ext}`;
  const outputName = `output.${ext}`;
  const transposeMap = { 90: "1", 180: "1,transpose=1", 270: "2" };
  const filter = transposeMap[degreesVal];

  return withFFmpeg(
    file,
    inputName,
    async (ffmpeg) => {
      const args = filter
        ? ["-i", inputName, "-vf", `transpose=${filter}`, "-c:a", "copy", outputName]
        : ["-i", inputName, "-c", "copy", outputName];
      await ffmpeg.exec(args);
      return readAndCleanup(ffmpeg, outputName, `video/${ext}`, [inputName, outputName]);
    },
    onProgress
  );
}

/** Overlay a text or image watermark on a video using ffmpeg's drawtext/overlay filters. */
export async function watermarkVideo(file, opts, onProgress) {
  const ext = extOf(file.name) || "mp4";
  const inputName = `input.${ext}`;
  const outputName = `output.${ext}`;

  return withFFmpeg(
    file,
    inputName,
    async (ffmpeg) => {
      if (opts.type === "image" && opts.imageFile) {
        const wmExt = extOf(opts.imageFile.name) || "png";
        const wmName = `watermark.${wmExt}`;
        await ffmpeg.writeFile(wmName, await fetchFile(opts.imageFile));
        const posMap = {
          "top-left": "10:10",
          "top-right": "main_w-overlay_w-10:10",
          "bottom-left": "10:main_h-overlay_h-10",
          "bottom-right": "main_w-overlay_w-10:main_h-overlay_h-10",
          center: "(main_w-overlay_w)/2:(main_h-overlay_h)/2",
        };
        const pos = posMap[opts.position] || posMap["bottom-right"];
        await ffmpeg.exec([
          "-i", inputName,
          "-i", wmName,
          "-filter_complex", `overlay=${pos}:format=auto,format=yuv420p`,
          "-c:a", "copy",
          outputName,
        ]);
        return readAndCleanup(ffmpeg, outputName, `video/${ext}`, [inputName, wmName, outputName]);
      }

      const text = (opts.text || "").replace(/'/g, "\\'").replace(/:/g, "\\:");
      const fontColor = opts.color || "white";
      const fontSize = opts.fontSize || 28;
      const posMap = {
        "top-left": "x=20:y=20",
        "top-right": "x=w-tw-20:y=20",
        "bottom-left": "x=20:y=h-th-20",
        "bottom-right": "x=w-tw-20:y=h-th-20",
        center: "x=(w-tw)/2:y=(h-th)/2",
      };
      const pos = posMap[opts.position] || posMap["bottom-right"];
      await ffmpeg.exec([
        "-i", inputName,
        "-vf", `drawtext=text='${text}':fontcolor=${fontColor}:fontsize=${fontSize}:${pos}:alpha=${opts.opacity ?? 0.7}`,
        "-c:a", "copy",
        outputName,
      ]);
      return readAndCleanup(ffmpeg, outputName, `video/${ext}`, [inputName, outputName]);
    },
    onProgress
  );
}
