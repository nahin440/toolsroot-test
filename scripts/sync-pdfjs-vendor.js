/**
 * Copies pdf.js's worker script, cmaps, standard fonts, WASM codecs, and
 * ICC profiles out of node_modules/pdfjs-dist and into public/vendor/pdfjs,
 * so they can be self-hosted (see pdfjs-loader.js) instead of fetched from
 * a CDN — keeping every byte of a user's PDF on-device.
 *
 * BACKGROUND — a real, confirmed bug this script fixes:
 *
 * pdfjs-loader.js loads the pdf.js *API* from node_modules (bundled into
 * the app's JS by webpack) but points GlobalWorkerOptions.workerSrc at a
 * static file under /vendor/pdfjs — served as-is, completely outside
 * webpack/npm's version resolution. pdf.js hard-fails at runtime with
 * "The API version ... does not match the Worker version ..." the moment
 * these two ever disagree, even by a patch version.
 *
 * public/vendor/pdfjs was previously populated by hand, once, and nothing
 * kept it in sync afterward. package.json pinned pdfjs-dist with a caret
 * range (^6.1.200), so every fresh `npm install` was free to resolve a
 * newer 6.x release for the API side while the committed worker file
 * stayed frozen at the exact version it was copied at — 6.1.200 vs the
 * 6.2.108 that later resolved. That drift is exactly what produced the
 * mismatch error rendered on the PDF to Markdown page.
 *
 * Fix, two parts (this script is the second):
 *   1. package.json now pins pdfjs-dist to an *exact* version (no caret),
 *      so `npm install` can never again resolve an API version newer than
 *      what's vendored.
 *   2. This script regenerates public/vendor/pdfjs from whatever
 *      pdfjs-dist version actually got installed, every install — so the
 *      vendored worker always matches the pinned version currently on
 *      disk, instead of relying on someone remembering to re-copy it by
 *      hand after the next pdfjs-dist bump.
 *
 * WHY THIS LIVES IN scripts/ INSTEAD OF BEING A ONE-OFF COPY:
 * node_modules is never committed and is fully replaced on every
 * `npm install`, so a hand-copied public/vendor/pdfjs silently goes stale
 * the moment pdfjs-dist's pinned version is ever bumped and reinstalled.
 * This script is wired up as a `postinstall` in package.json, so the
 * vendor copy regenerates itself automatically and identically for every
 * teammate, CI run, and deployment — it can never again drift from
 * whatever pdfjs-dist version package.json actually pins.
 *
 * Idempotent and safe to run repeatedly: it always copies fresh (removing
 * any previous vendor copy first), so re-running with the same installed
 * version is a harmless no-op in effect. If pdfjs-dist isn't installed,
 * or a future version moves these paths, it warns and skips rather than
 * failing the install.
 */
const fs = require("fs");
const path = require("path");

const PKG_ROOT = path.join(__dirname, "..");
const PDFJS_ROOT = path.join(PKG_ROOT, "node_modules", "pdfjs-dist");
const VENDOR_DIR = path.join(PKG_ROOT, "public", "vendor", "pdfjs");

// [sourcePath relative to PDFJS_ROOT, destName relative to VENDOR_DIR, isDir]
const ASSETS = [
  [path.join("build", "pdf.worker.min.mjs"), "pdf.worker.min.mjs", false],
  ["cmaps", "cmaps", true],
  ["standard_fonts", "standard_fonts", true],
  ["wasm", "wasm", true],
  ["iccs", "iccs", true],
];

function main() {
  if (!fs.existsSync(PDFJS_ROOT)) {
    // pdfjs-dist isn't installed (e.g. a partial/CI install that skips
    // it). Nothing to sync — don't fail the install over it.
    console.log("[sync-pdfjs-vendor] pdfjs-dist not found in node_modules, skipping.");
    return;
  }

  const missing = ASSETS.filter(([src]) => !fs.existsSync(path.join(PDFJS_ROOT, src)));
  if (missing.length > 0) {
    // A future pdfjs-dist version restructured its package layout. Don't
    // guess at a different path — surface it so it can be re-checked, but
    // still don't block the install. The old vendor copy (if any) is left
    // as-is, so this is a "still shows the old error" regression, not a
    // "site is broken" one.
    console.warn(
      "[sync-pdfjs-vendor] expected pdfjs-dist paths not found: " +
        missing.map(([src]) => src).join(", ") +
        " — pdfjs-dist may have restructured its package. Skipping sync; " +
        "if the pdf.js API/Worker version mismatch error returns, this " +
        "script needs updating for the new pdfjs-dist version."
    );
    return;
  }

  const { version } = JSON.parse(
    fs.readFileSync(path.join(PDFJS_ROOT, "package.json"), "utf8")
  );

  fs.rmSync(VENDOR_DIR, { recursive: true, force: true });
  fs.mkdirSync(VENDOR_DIR, { recursive: true });

  for (const [src, dest, isDir] of ASSETS) {
    fs.cpSync(path.join(PDFJS_ROOT, src), path.join(VENDOR_DIR, dest), {
      recursive: isDir,
    });
  }

  console.log(
    `[sync-pdfjs-vendor] synced public/vendor/pdfjs from pdfjs-dist@${version}.`
  );
}

main();
