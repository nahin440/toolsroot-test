"use client";

/**
 * Lazily creates and loads a shared FFmpeg instance, pointed at the
 * self-hosted core files under /vendor/ffmpeg (see public/vendor/ffmpeg)
 * rather than an external CDN, so a user's audio/video content never
 * involves a third-party network request tied to their file.
 *
 * Multi-threaded core (core-mt) is used automatically when the page is
 * cross-origin-isolated (requires the COOP/COEP headers configured in
 * next.config — see that file's headers() function), since MT ffmpeg
 * needs SharedArrayBuffer. Falls back to the single-threaded core
 * everywhere else, which works with zero special headers.
 */
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";

let ffmpegPromise = null;

function isCrossOriginIsolated() {
  return typeof window !== "undefined" && window.crossOriginIsolated === true;
}

/**
 * onLoadProgress, if given, is called with a value in [0, 1] tracking the
 * download of the ffmpeg-core.wasm file specifically — at ~31MB, it is the
 * overwhelming majority of the roughly 31.1-31.2MB total this function
 * downloads on a person's first video/audio tool of a session (the .js
 * core is ~112-128KB, the MT worker file ~4KB — tracking those too would
 * not move the reported percentage in any way a person could perceive, so
 * this only wires progress for the one file where it matters). Not
 * called at all on a warm ffmpegPromise (i.e. every subsequent tool run
 * within the same session): the point of this is surfacing the one-time
 * "downloading the engine" wait on first use, not adding a progress
 * event to an operation that no longer does any downloading.
 *
 * Uses @ffmpeg/util's own toBlobURL(url, mimeType, progress, cb) rather
 * than a hand-rolled fetch+ReadableStream reader — the progress=true path
 * already exists in that library (see downloadWithProgress in
 * node_modules/@ffmpeg/util), degrades gracefully to a plain fetch if the
 * server omits Content-Length or streaming isn't available, and matches
 * how this same file already fetches the .js/.worker cores, so this
 * doesn't introduce a second, differently-behaved download path.
 */
export async function getFFmpeg(onLog, onLoadProgress) {
  if (ffmpegPromise) return ffmpegPromise;

  ffmpegPromise = (async () => {
    const ffmpeg = new FFmpeg();
    if (onLog) {
      ffmpeg.on("log", ({ message }) => onLog(message));
    }

    const useMt = isCrossOriginIsolated();
    const coreDir = useMt ? "/vendor/ffmpeg/core-mt" : "/vendor/ffmpeg/core";

    const coreURL = await toBlobURL(`${coreDir}/ffmpeg-core.js`, "text/javascript");
    const wasmURL = await toBlobURL(
      `${coreDir}/ffmpeg-core.wasm`,
      "application/wasm",
      Boolean(onLoadProgress),
      onLoadProgress
        ? ({ total, received }) => {
            // total is -1 when the server didn't send Content-Length
            // (see downloadWithProgress) — report nothing rather than a
            // wrong or NaN percentage in that case; the caller's own
            // fallback ("Loading video engine…" with no number) still
            // shows a real indeterminate-state message either way.
            if (total > 0) onLoadProgress(Math.min(received / total, 1));
          }
        : undefined
    );
    const loadOpts = { coreURL, wasmURL };

    if (useMt) {
      loadOpts.workerURL = await toBlobURL(`${coreDir}/ffmpeg-core.worker.js`, "text/javascript");
    }

    await ffmpeg.load(loadOpts);
    return ffmpeg;
  })();

  return ffmpegPromise;
}

export async function resetFFmpeg() {
  if (ffmpegPromise) {
    const ffmpeg = await ffmpegPromise;
    ffmpeg.terminate();
    ffmpegPromise = null;
  }
}
