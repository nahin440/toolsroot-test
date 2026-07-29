/**
 * Patches @ffmpeg/ffmpeg's worker.js so the dynamic import() of the
 * (blob-URL) core script is never touched by webpack's static import
 * analysis.
 *
 * BACKGROUND — a real, confirmed bug in @ffmpeg/ffmpeg 0.12.x:
 *
 * ffmpeg-loader.js builds `coreURL` via @ffmpeg/util's toBlobURL(), so
 * ffmpeg's core JS/WASM never needs a third-party network request. That
 * blob: URL is handed to ffmpeg.load(), which spawns a `type: "module"`
 * Worker running the library's own worker.js. Inside that worker,
 * `importScripts(coreURL)` always throws for a module worker (that API
 * doesn't exist there), so the code falls into its catch block and does
 * `await import(coreURL)` instead — but webpack statically rewrites
 * plain `import()` calls into its own chunk-loading runtime, which
 * tries to resolve the string as a build-time module specifier. A
 * `blob:` URL is not a valid specifier in that scheme, so it throws
 * `Error: Cannot find module 'blob:http://.../<uuid>'` — this is the
 * exact error users hit on every audio/video tool (confirmed via the
 * upstream issue below, same error string, same worker.js call site).
 *
 * Fix: add the `/* webpackIgnore: true *\/` magic comment immediately
 * before that one import() call. Webpack recognizes this comment and
 * leaves the import() completely alone, emitting it as a real, runtime
 * dynamic import — which handles a blob: URL correctly, exactly as it
 * does when called from the main thread. This is the fix the ffmpeg.wasm
 * maintainers/community landed on for this exact issue:
 * https://github.com/ffmpegwasm/ffmpeg.wasm/issues/619
 *
 * WHY THIS LIVES IN scripts/ INSTEAD OF BEING EDITED DIRECTLY:
 * node_modules is never committed and gets fully replaced on every
 * `npm install`, so a hand-edit there is invisible to git and silently
 * reverts for every teammate, CI run, and deployment. This script is
 * wired up as a `postinstall` in package.json, so the patch reapplies
 * itself automatically and identically everywhere, every time.
 *
 * Idempotent and safe to run repeatedly: if the file is missing (e.g. a
 * future @ffmpeg/ffmpeg upgrade restructures it) or already patched, it
 * exits quietly without changing anything, rather than failing the
 * install.
 */
const fs = require("fs");
const path = require("path");

const TARGET = path.join(
  __dirname,
  "..",
  "node_modules",
  "@ffmpeg",
  "ffmpeg",
  "dist",
  "esm",
  "worker.js"
);

const UNPATCHED = "self.createFFmpegCore = (await import(\n        /* @vite-ignore */ _coreURL)).default;";
const PATCHED = "self.createFFmpegCore = (await import(\n        /* webpackIgnore: true */ /* @vite-ignore */ _coreURL)).default;";

function main() {
  if (!fs.existsSync(TARGET)) {
    // @ffmpeg/ffmpeg isn't installed (e.g. a partial/CI install that
    // skips it) or a future version moved/renamed this file. Either way,
    // there's nothing to patch — don't fail the install over it.
    console.log("[patch-ffmpeg-worker] worker.js not found, skipping (nothing to patch).");
    return;
  }

  const content = fs.readFileSync(TARGET, "utf8");

  if (content.includes("webpackIgnore: true")) {
    console.log("[patch-ffmpeg-worker] already patched, skipping.");
    return;
  }

  if (!content.includes(UNPATCHED)) {
    // The library changed this code in a way we don't recognize.
    // Don't guess — surface it so it can be re-checked, but still don't
    // block the install (a stale/incompatible patch is not fatal; the
    // user will just see the original blob-URL error again, which is
    // the pre-patch behavior, not a regression from this script).
    console.warn(
      "[patch-ffmpeg-worker] expected code not found in worker.js — " +
        "@ffmpeg/ffmpeg may have changed. Skipping patch; if the " +
        "'Cannot find module blob:...' error returns, this script needs " +
        "updating for the new @ffmpeg/ffmpeg version."
    );
    return;
  }

  fs.writeFileSync(TARGET, content.replace(UNPATCHED, PATCHED), "utf8");
  console.log("[patch-ffmpeg-worker] patched worker.js (added webpackIgnore for the blob-URL core import).");
}

main();
