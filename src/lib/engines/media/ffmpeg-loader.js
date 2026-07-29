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

export async function getFFmpeg(onLog) {
  if (ffmpegPromise) return ffmpegPromise;

  ffmpegPromise = (async () => {
    const ffmpeg = new FFmpeg();
    if (onLog) {
      ffmpeg.on("log", ({ message }) => onLog(message));
    }

    const useMt = isCrossOriginIsolated();
    const coreDir = useMt ? "/vendor/ffmpeg/core-mt" : "/vendor/ffmpeg/core";

    const coreURL = await toBlobURL(`${coreDir}/ffmpeg-core.js`, "text/javascript");
    const wasmURL = await toBlobURL(`${coreDir}/ffmpeg-core.wasm`, "application/wasm");
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
