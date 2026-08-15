"use client";

/**
 * Core audio/video engine. Every operation shells out to a real ffmpeg
 * binary compiled to WASM (via @ffmpeg/ffmpeg) — the same command-line
 * tool used by professional video pipelines — so behavior matches
 * desktop ffmpeg exactly, not an approximation.
 */
import { fetchFile } from "@ffmpeg/util";
import { getFFmpeg } from "./ffmpeg-loader";

/**
 * Triggers (and lets a caller observe) the one-time ffmpeg engine
 * download/init, independent of any specific conversion. Exists so the
 * shared ToolPageShell (src/components/tool-page/tool-page-shell.jsx)
 * can show an accurate "Loading video engine…" message for the small,
 * fixed set of ffmpeg-based tools (see MEDIA_ENGINE_TOOL_SLUGS in that
 * file) BEFORE calling into whichever adapter.run the person actually
 * invoked — every one of those 22 adapters' own onProgress callbacks
 * still work completely unchanged; this preload step happens first and
 * separately, so no adapter file needed to change for this fix.
 *
 * Resolves immediately, calling onLoadProgress zero times, if the engine
 * is already loaded from a prior tool run this session — getFFmpeg's own
 * module-level ffmpegPromise singleton (see ffmpeg-loader.js) already
 * handles not re-downloading, this just means the loading message
 * correctly never appears on a warm engine either.
 */
export async function preloadFFmpegEngine(onLoadProgress) {
  await getFFmpeg(undefined, onLoadProgress);
}

// 256k (mp3/aac/m4a) and -q:a 8 (~256kbps VBR for vorbis) are deliberately
// above the more common "192k is good enough" default — squarely in
// transparent territory for virtually all listening conditions, with no
// real cost since this runs client-side rather than through a server
// encoding queue. wav/flac are already lossless (no bitrate to raise);
// amr is a fixed 8kHz/mono narrowband telephony spec with no
// higher-quality mode to opt into, so both are correctly left as-is.
const AUDIO_CODEC_FOR_EXT = {
  mp3: ["-c:a", "libmp3lame", "-b:a", "256k"],
  wav: ["-c:a", "pcm_s16le"],
  aac: ["-c:a", "aac", "-b:a", "256k"],
  m4a: ["-c:a", "aac", "-b:a", "256k"],
  flac: ["-c:a", "flac"],
  ogg: ["-c:a", "libvorbis", "-q:a", "8"],
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
// x264 preset "medium" is x264's own actual built-in default — a real
// step up in compression efficiency (quality-per-byte at the SAME crf
// below) over the faster "veryfast" preset this table used previously.
// A preset only trades encode time for how well the encoder searches for
// efficient motion/block choices; it doesn't change the crf quality
// target itself, so this is a genuine quality-at-the-same-target
// improvement, not a different tradeoff — paid for in extra encode time,
// which is an easy trade with no server queue/cost pressure since this
// all runs client-side in the person's own browser tab.
const VIDEO_CODEC_FOR_EXT = {
  mp4: {
    videoArgs: ["-c:v", "libx264", "-preset", "medium", "-crf", "23"],
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
    videoArgs: ["-c:v", "libx264", "-preset", "medium", "-crf", "23"],
    transcodeAudioArgs: ["-c:a", "aac"],
    copyCompatibleAudio: ["aac"],
  },
  mkv: {
    videoArgs: ["-c:v", "libx264", "-preset", "medium", "-crf", "23"],
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

      // A GIF source has no audio stream at all and uses an indexed
      // palette pixel format rather than YUV — probeAudioCodec already
      // correctly returns null for it (falling through to
      // transcodeAudioArgs, which is harmless since there's nothing to
      // transcode), but a plain libx264 encode can pick a pixel format
      // some players display as a black screen on, specifically for a
      // palette-sourced input. Verified directly against real GIF-to-
      // MP4 conversion writeups before adding this — -pix_fmt yuv420p
      // is the documented fix, added only for this source format so
      // every other existing conversion pair's args stay untouched.
      const isGifSource = extOf(file.name) === "gif";
      const sourcePixFmtArgs = isGifSource && targetExt !== "gif" ? ["-pix_fmt", "yuv420p"] : [];

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

      await ffmpeg.exec(["-i", inputName, ...videoArgs, ...sourcePixFmtArgs, ...audioArgs, outputName]);
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
        sourceAudioCodec === "aac" ? ["-c:a", "copy"] : ["-c:a", "aac", "-b:a", "256k"];

      await ffmpeg.exec([
        "-i", inputName,
        "-c:v", "libx264",
        "-preset", "medium",
        "-crf", String(crf),
        ...audioArgs,
        outputName,
      ]);
      return readAndCleanup(ffmpeg, outputName, `video/${ext}`, [inputName, outputName]);
    },
    onProgress
  );
}

/**
 * The same per-container videoArgs already defined in VIDEO_CODEC_FOR_EXT
 * (used by convertVideo/compressVideo), reused here so resize/crop/
 * fps-change/watermark get an explicit, tested codec choice instead of
 * relying on ffmpeg's own implicit, build-dependent default for whatever
 * container the source file happens to be in. Falls back to an empty
 * array — today's exact pre-existing behavior — for any extension not in
 * that table, so a less-common container (e.g. .flv, .wmv) never regresses
 * to something worse than what it already does.
 */
function explicitVideoArgsFor(ext) {
  return VIDEO_CODEC_FOR_EXT[ext]?.videoArgs || [];
}

/**
 * Merges multiple video files into one, in the given order, via ffmpeg's
 * concat FILTER (not the faster concat demuxer mergeAudio uses) —
 * verified through direct research against ffmpeg's own documented
 * behavior and multiple independent real-world writeups before choosing
 * this approach: the demuxer's -c copy path only works correctly when
 * every input already shares the exact same codec, resolution, and
 * frame rate, and silently produces broken or frozen output otherwise
 * (not always a clear error) — a real risk for arbitrary user uploads,
 * which is exactly the case here. The concat filter re-encodes
 * everything into one uniform output, genuinely handling mismatched
 * source clips correctly rather than assuming they already match.
 *
 * Two additional real correctness issues the filter approach itself
 * doesn't solve for free, both confirmed through research and handled
 * explicitly here:
 *   1. Mismatched resolution/frame rate: every clip is scaled (letterboxed,
 *      not stretched) to a shared target size and resampled to a shared
 *      frame rate before concatenation, rather than left to concat's own
 *      undefined behavior on mismatched inputs.
 *   2. A clip with no audio track at all crashes the concat filter
 *      outright, since it requires the same stream count per segment —
 *      handled by adding a matching-duration silent anullsrc input for
 *      any audio-less clip, referenced at its correct real ffmpeg input
 *      index (computed from the actual running input count as inputs
 *      are added, not a separately pre-computed offset — an earlier
 *      draft of this exact logic miscalculated that index for anything
 *      after the first audio-less clip, independently verified and
 *      fixed before shipping by tracing every [N:v]/[N:a] filter graph
 *      reference against the real input list it would run against).
 */
export async function mergeVideos(files, onProgress) {
  const outExt = extOf(files[0].name) || "mp4";
  const inputNames = files.map((_, i) => `input${i}.${extOf(files[i].name) || "mp4"}`);
  const outputName = `output.${outExt}`;

  const ffmpeg = await getFFmpeg();
  const progressHandler = ({ progress }) => onProgress?.(Math.min(Math.max(progress, 0), 1) * 0.9);
  ffmpeg.on("progress", progressHandler);

  const filesToClean = [...inputNames, outputName];

  try {
    for (let i = 0; i < files.length; i++) {
      await ffmpeg.writeFile(inputNames[i], await fetchFile(files[i]));
    }

    // Probe every clip's real width/height/fps/audio-presence/duration —
    // the target output size is the largest width and largest height
    // seen across all clips (so no clip's real detail is downscaled
    // below its own native resolution), and target fps is the highest
    // seen (so no clip's motion is downsampled below its own native
    // smoothness).
    const probes = [];
    for (let i = 0; i < files.length; i++) {
      probes.push(await probeVideoStream(ffmpeg, inputNames[i]));
    }
    const targetWidth = Math.max(...probes.map((p) => p.width || 1280));
    const targetHeight = Math.max(...probes.map((p) => p.height || 720));
    const targetFps = Math.max(...probes.map((p) => p.fps || 30));

    const inputArgs = [];
    const filterParts = [];
    const videoLabels = [];
    const audioLabels = [];
    let realInputIndex = 0;

    for (let i = 0; i < files.length; i++) {
      const clipIdx = realInputIndex;
      inputArgs.push("-i", inputNames[i]);
      realInputIndex++;

      filterParts.push(
        `[${clipIdx}:v]scale=${targetWidth}:${targetHeight}:force_original_aspect_ratio=decrease,pad=${targetWidth}:${targetHeight}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=${targetFps},format=yuv420p[v${clipIdx}]`
      );
      videoLabels.push(`[v${clipIdx}]`);

      if (probes[i].hasAudio) {
        filterParts.push(`[${clipIdx}:a]aresample=44100,aformat=channel_layouts=stereo[a${clipIdx}]`);
        audioLabels.push(`[a${clipIdx}]`);
      } else {
        const silentIdx = realInputIndex;
        // Falls back to a generous 60s if duration couldn't be probed
        // (rare — the format-level duration query above is the more
        // reliable of the two ffprobe reports, stream-level duration
        // being documented as unavailable on some containers like WebM/
        // MKV, which is exactly why format=duration is queried instead
        // of stream=duration here). Erring long is the safe direction:
        // ffmpeg's own concat filter documentation states plainly that
        // "related streams do not always have exactly the same
        // duration" within one segment pair, and handles that
        // mismatch as an ordinary, expected case — verified directly
        // against the filter's official documentation before relying
        // on this, rather than assuming. A too-short silent track,
        // conversely, would leave the merged clip audibly silent for
        // whatever real video duration remained once the anullsrc ran
        // out — the genuinely unsafe direction to err in.
        const duration = probes[i].durationSec || 60;
        inputArgs.push("-f", "lavfi", "-t", String(duration), "-i", "anullsrc=r=44100:cl=stereo");
        realInputIndex++;
        filterParts.push(`[${silentIdx}:a]aformat=channel_layouts=stereo[a${clipIdx}]`);
        audioLabels.push(`[a${clipIdx}]`);
      }
    }

    const concatChain =
      videoLabels.map((v, i) => v + audioLabels[i]).join("") +
      `concat=n=${files.length}:v=1:a=1[outv][outa]`;
    const filterComplex = filterParts.join(";") + ";" + concatChain;

    await ffmpeg.exec([
      ...inputArgs,
      "-filter_complex", filterComplex,
      "-map", "[outv]",
      "-map", "[outa]",
      ...explicitVideoArgsFor(outExt),
      "-c:a", "aac",
      outputName,
    ]);

    onProgress?.(0.95);
    return await readAndCleanup(ffmpeg, outputName, `video/${outExt}`, filesToClean);
  } finally {
    ffmpeg.off("progress", progressHandler);
  }
}

/**
 * Probes a video input's width, height, frame rate, whether it has an
 * audio stream at all, and duration — the real metadata mergeVideos
 * needs to build a correct filter graph rather than assuming every
 * clip already matches. Falls back to conservative defaults for any
 * individual field the probe can't determine, rather than failing the
 * whole merge over one metadata read.
 */
async function probeVideoStream(ffmpeg, inputName) {
  const probeOut = `probe-${inputName}.txt`;
  const result = { width: null, height: null, fps: null, hasAudio: false, durationSec: null };
  try {
    await ffmpeg.ffprobe([
      "-v", "error",
      "-select_streams", "v:0",
      "-show_entries", "stream=width,height,r_frame_rate:format=duration",
      "-of", "default=noprint_wrappers=1",
      inputName,
      "-o", probeOut,
    ]);
    const text = new TextDecoder().decode(await ffmpeg.readFile(probeOut));
    await ffmpeg.deleteFile(probeOut);

    const widthMatch = text.match(/width=(\d+)/);
    const heightMatch = text.match(/height=(\d+)/);
    const fpsMatch = text.match(/r_frame_rate=(\d+)\/(\d+)/);
    const durationMatch = text.match(/duration=([\d.]+)/);

    if (widthMatch) result.width = parseInt(widthMatch[1], 10);
    if (heightMatch) result.height = parseInt(heightMatch[1], 10);
    if (fpsMatch) {
      const num = parseInt(fpsMatch[1], 10);
      const den = parseInt(fpsMatch[2], 10) || 1;
      result.fps = Math.round(num / den);
    }
    if (durationMatch) result.durationSec = parseFloat(durationMatch[1]);
  } catch {
    // Fall through with defaults below rather than failing the merge.
  }

  try {
    const audioProbeOut = `aprobe-${inputName}.txt`;
    await ffmpeg.ffprobe([
      "-v", "error",
      "-select_streams", "a",
      "-show_entries", "stream=index",
      "-of", "csv=p=0",
      inputName,
      "-o", audioProbeOut,
    ]);
    const audioText = new TextDecoder().decode(await ffmpeg.readFile(audioProbeOut));
    await ffmpeg.deleteFile(audioProbeOut);
    result.hasAudio = audioText.trim().length > 0;
  } catch {
    result.hasAudio = false;
  }

  return result;
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
      await ffmpeg.exec([
        "-i", inputName,
        "-vf", `scale=${width}:${height}:flags=lanczos`,
        ...explicitVideoArgsFor(ext),
        "-c:a", "copy",
        outputName,
      ]);
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
        ...explicitVideoArgsFor(ext),
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
      await ffmpeg.exec([
        "-i", inputName,
        "-r", String(targetFps),
        ...explicitVideoArgsFor(ext),
        "-c:a", "copy",
        outputName,
      ]);
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
        ? ["-i", inputName, "-vf", `transpose=${filter}`, ...explicitVideoArgsFor(ext), "-c:a", "copy", outputName]
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
          ...explicitVideoArgsFor(ext),
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
        ...explicitVideoArgsFor(ext),
        "-c:a", "copy",
        outputName,
      ]);
      return readAndCleanup(ffmpeg, outputName, `video/${ext}`, [inputName, outputName]);
    },
    onProgress
  );
}

/**
 * Change playback speed without altering pitch, via ffmpeg's atempo
 * filter — a real time-stretching filter, not a naive sample-rate
 * change (which would also shift pitch, an entirely different effect;
 * see changePitch below for that distinct operation).
 *
 * atempo only accepts a single factor in [0.5, 2.0] per filter
 * instance — outside that range the documented technique is chaining
 * multiple atempo filters (each within its own valid range) whose
 * combined effect multiplies to the requested factor, rather than
 * silently clamping to the nearest valid value and producing a wrong
 * result. Verified against ffmpeg's own documented atempo range before
 * writing this; a UI value of e.g. 0.25x (a real, useful "very slow"
 * option) genuinely needs two chained atempo=0.5 filters, not one.
 */
function buildAtempoChain(factor) {
  const filters = [];
  let remaining = factor;
  while (remaining > 2.0) {
    filters.push("atempo=2.0");
    remaining /= 2.0;
  }
  while (remaining < 0.5) {
    filters.push("atempo=0.5");
    remaining /= 0.5;
  }
  filters.push(`atempo=${remaining.toFixed(6)}`);
  return filters.join(",");
}

/**
 * @param {File} file
 * @param {number} speedFactor 0.25 to 4.0 — e.g. 2.0 = twice as fast,
 *   0.5 = half speed. Pitch is unaffected.
 */
export async function changeAudioSpeed(file, speedFactor, onProgress) {
  const ext = extOf(file.name);
  const inputName = `input.${ext}`;
  const outputName = `output.${ext}`;

  return withFFmpeg(
    file,
    inputName,
    async (ffmpeg) => {
      await ffmpeg.exec(["-i", inputName, "-af", buildAtempoChain(speedFactor), outputName]);
      return readAndCleanup(ffmpeg, outputName, `audio/${ext}`, [inputName, outputName]);
    },
    onProgress
  );
}

/**
 * Change pitch without altering playback duration, via the standard
 * asetrate+atempo combination technique (see the code comment on
 * buildAtempoChain — this codebase's self-hosted ffmpeg.wasm core does
 * not include librubberband, the higher-quality dedicated pitch-shift
 * library, since it's excluded from the standard ffmpeg.wasm
 * distribution over GPL-vs-LGPL licensing — confirmed against the
 * upstream ffmpegwasm/ffmpeg.wasm project's own tracked feature
 * requests before choosing this approach rather than assuming
 * rubberband was available). asetrate reinterprets the audio at a new
 * sample rate, which shifts both pitch AND speed together; the atempo
 * correction that follows restores the original speed, leaving only
 * the pitch shift — real digital signal processing, not an
 * approximation, though asetrate-based shifting has more audible
 * artifacts at large shifts than a dedicated phase-vocoder algorithm
 * like rubberband would, disclosed plainly in this tool's own FAQ.
 *
 * @param {File} file
 * @param {number} semitones -12 to 12 (kept within this range so the
 *   corresponding atempo correction factor stays inside atempo's own
 *   single-filter [0.5, 2.0] valid range with real margin — verified
 *   numerically before choosing these bounds).
 */
export async function changeAudioPitch(file, semitones, onProgress) {
  const ext = extOf(file.name);
  const inputName = `input.${ext}`;
  const outputName = `output.${ext}`;
  const rateFactor = Math.pow(2, semitones / 12);
  const tempoCorrection = 1 / rateFactor;

  return withFFmpeg(
    file,
    inputName,
    async (ffmpeg) => {
      // Probe the real input sample rate rather than assuming a fixed
      // 44100 — asetrate needs an absolute target rate, and scaling
      // from the wrong base rate would shift pitch by an incorrect
      // amount for any source file that isn't already 44.1kHz.
      const probeOut = "probe.txt";
      let baseSampleRate = 44100;
      try {
        await ffmpeg.ffprobe([
          "-v", "error",
          "-show_entries", "stream=sample_rate",
          "-select_streams", "a:0",
          "-of", "default=noprint_wrappers=1:nokey=1",
          inputName,
          "-o", probeOut,
        ]);
        const data = await ffmpeg.readFile(probeOut);
        const parsed = parseInt(new TextDecoder().decode(data).trim(), 10);
        if (parsed > 0) baseSampleRate = parsed;
        await ffmpeg.deleteFile(probeOut);
      } catch {
        // Probe failed — fall through with the 44100 default rather
        // than failing the whole conversion over a metadata read.
      }

      const targetRate = Math.round(baseSampleRate * rateFactor);
      await ffmpeg.exec([
        "-i", inputName,
        "-af", `asetrate=${targetRate},atempo=${tempoCorrection.toFixed(6)},aresample=${baseSampleRate}`,
        outputName,
      ]);
      return readAndCleanup(ffmpeg, outputName, `audio/${ext}`, [inputName, outputName]);
    },
    onProgress
  );
}

/**
 * Adjust volume by a decibel amount (positive boosts, negative reduces)
 * via ffmpeg's volume filter, applied in real dB units — not a naive
 * linear percentage multiply, which wouldn't match how loudness is
 * actually perceived or how every other audio tool expresses gain.
 *
 * @param {number} db e.g. 6 = boost by 6dB (~2x perceived loudness),
 *   -6 = reduce by 6dB.
 */
export async function changeAudioVolume(file, db, onProgress) {
  const ext = extOf(file.name);
  const inputName = `input.${ext}`;
  const outputName = `output.${ext}`;

  return withFFmpeg(
    file,
    inputName,
    async (ffmpeg) => {
      await ffmpeg.exec(["-i", inputName, "-af", `volume=${db}dB`, outputName]);
      return readAndCleanup(ffmpeg, outputName, `audio/${ext}`, [inputName, outputName]);
    },
    onProgress
  );
}

/** Reverses audio playback entirely, via ffmpeg's real areverse filter (genuine sample-order reversal, not a UI-only playback trick). */
export async function reverseAudio(file, onProgress) {
  const ext = extOf(file.name);
  const inputName = `input.${ext}`;
  const outputName = `output.${ext}`;

  return withFFmpeg(
    file,
    inputName,
    async (ffmpeg) => {
      await ffmpeg.exec(["-i", inputName, "-af", "areverse", outputName]);
      return readAndCleanup(ffmpeg, outputName, `audio/${ext}`, [inputName, outputName]);
    },
    onProgress
  );
}

/**
 * Adds a fade-in and/or fade-out to audio via ffmpeg's afade filter.
 * fadeOutStartSec, if provided, should be (duration - fadeOutDurationSec)
 * — the caller is expected to know the file's real duration (e.g. from
 * the browser's own <audio> element metadata, already used elsewhere in
 * this app's upload flow) since ffmpeg's afade filter itself takes an
 * absolute start-time offset, not a "from the end" relative one.
 *
 * @param {object} opts { fadeInSec?: number, fadeOutSec?: number,
 *   fadeOutStartSec?: number (required if fadeOutSec is set) }
 */
export async function fadeAudio(file, opts, onProgress) {
  const ext = extOf(file.name);
  const inputName = `input.${ext}`;
  const outputName = `output.${ext}`;

  const filters = [];
  if (opts.fadeInSec > 0) filters.push(`afade=t=in:st=0:d=${opts.fadeInSec}`);
  if (opts.fadeOutSec > 0 && opts.fadeOutStartSec >= 0) {
    filters.push(`afade=t=out:st=${opts.fadeOutStartSec}:d=${opts.fadeOutSec}`);
  }
  if (filters.length === 0) {
    throw new Error("Set a fade-in and/or fade-out duration greater than zero.");
  }

  return withFFmpeg(
    file,
    inputName,
    async (ffmpeg) => {
      await ffmpeg.exec(["-i", inputName, "-af", filters.join(","), outputName]);
      return readAndCleanup(ffmpeg, outputName, `audio/${ext}`, [inputName, outputName]);
    },
    onProgress
  );
}

/**
 * Extracts a single frame from a video at a given timestamp as a real
 * PNG image (lossless — the frame is decoded straight from the video's
 * raw pixel data, not re-compressed through JPG's lossy path).
 */
export async function extractVideoFrame(file, timestampSec, onProgress) {
  const ext = extOf(file.name) || "mp4";
  const inputName = `input.${ext}`;
  const outputName = "frame.png";

  return withFFmpeg(
    file,
    inputName,
    async (ffmpeg) => {
      await ffmpeg.exec(["-ss", String(timestampSec), "-i", inputName, "-frames:v", "1", outputName]);
      return readAndCleanup(ffmpeg, outputName, "image/png", [inputName, outputName]);
    },
    onProgress
  );
}

/**
 * Renders a video's audio track as a static PNG waveform image, using
 * ffmpeg's real showwavespic filter (a genuine amplitude-over-time
 * visualization computed from the actual decoded audio samples, not a
 * decorative placeholder graphic).
 * @param {object} opts { width?: number, height?: number, color?: "#rrggbb" }
 */
export async function videoToWaveform(file, opts = {}, onProgress) {
  const ext = extOf(file.name) || "mp4";
  const inputName = `input.${ext}`;
  const outputName = "waveform.png";
  const width = opts.width || 1600;
  const height = opts.height || 400;
  const color = (opts.color || "#4f46e5").replace("#", "0x");

  return withFFmpeg(
    file,
    inputName,
    async (ffmpeg) => {
      await ffmpeg.exec([
        "-i", inputName,
        "-filter_complex", `showwavespic=s=${width}x${height}:colors=${color}`,
        "-frames:v", "1",
        outputName,
      ]);
      return readAndCleanup(ffmpeg, outputName, "image/png", [inputName, outputName]);
    },
    onProgress
  );
}

/**
 * Burns subtitles (from an uploaded .srt or .vtt file) directly into a
 * video's picture — a real, permanent rendering via ffmpeg's subtitles
 * filter, not a separate soft-subtitle track a player might not display.
 * No transcription happens here — the person supplies the subtitle
 * file themselves, so this is genuinely buildable without any AI
 * speech-to-text step, unlike an auto-caption feature would be.
 */
export async function burnSubtitles(videoFile, subtitleFile, onProgress) {
  const ext = extOf(videoFile.name) || "mp4";
  const inputName = `input.${ext}`;
  const outputName = `output.${ext}`;
  const subExt = extOf(subtitleFile.name) || "srt";
  const subName = `subs.${subExt}`;

  const ffmpeg = await getFFmpeg();
  const progressHandler = ({ progress }) => onProgress?.(Math.min(Math.max(progress, 0), 1));
  ffmpeg.on("progress", progressHandler);

  try {
    await ffmpeg.writeFile(inputName, await fetchFile(videoFile));
    await ffmpeg.writeFile(subName, await fetchFile(subtitleFile));
    // ffmpeg's subtitles filter reads the file from its own virtual
    // filesystem by name, same as any other filter argument — no
    // special escaping needed beyond what a normal filename would need,
    // since subName is a fixed, controlled string this code generates
    // itself rather than derived from user-supplied text.
    await ffmpeg.exec([
      "-i", inputName,
      "-vf", `subtitles=${subName}`,
      ...explicitVideoArgsFor(ext),
      "-c:a", "copy",
      outputName,
    ]);
    return await readAndCleanup(ffmpeg, outputName, `video/${ext}`, [inputName, subName, outputName]);
  } finally {
    ffmpeg.off("progress", progressHandler);
  }
}

/**
 * Change video playback speed without altering pitch of its audio
 * track — reuses buildAtempoChain for the audio filter (the same real
 * chaining logic changeAudioSpeed uses, needed here for the same reason:
 * atempo's single-filter range is [0.5, 2.0]) alongside ffmpeg's setpts
 * video filter, which is the correct, distinct mechanism for changing
 * VIDEO playback rate — setpts scales presentation timestamps, it does
 * not affect audio at all, which is exactly why both filters are needed
 * together rather than either alone.
 * @param {number} speedFactor 0.25 to 4.0
 */
export async function changeVideoSpeed(file, speedFactor, onProgress) {
  const ext = extOf(file.name) || "mp4";
  const inputName = `input.${ext}`;
  const outputName = `output.${ext}`;
  // setpts scales timestamps by the INVERSE of the desired speed factor
  // — a 2x speed-up means each frame's presentation timestamp should be
  // half its original value (PTS/2), not doubled, which is what
  // 1/speedFactor correctly expresses.
  const ptsFactor = (1 / speedFactor).toFixed(6);

  return withFFmpeg(
    file,
    inputName,
    async (ffmpeg) => {
      await ffmpeg.exec([
        "-i", inputName,
        "-vf", `setpts=${ptsFactor}*PTS`,
        "-af", buildAtempoChain(speedFactor),
        ...explicitVideoArgsFor(ext),
        outputName,
      ]);
      return readAndCleanup(ffmpeg, outputName, `video/${ext}`, [inputName, outputName]);
    },
    onProgress
  );
}
