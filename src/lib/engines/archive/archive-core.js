"use client";

/**
 * Archive engine. ZIP creation/extraction uses JSZip directly (simpler
 * and faster for the extremely common ZIP case). Every other format —
 * 7Z, TAR, GZ, and RAR extraction — goes through 7z-wasm, which is the
 * real 7-Zip command-line binary compiled to WebAssembly, not a
 * reimplementation. This is what makes 7Z/TAR *creation* genuinely
 * possible (the previous build's README listed these as missing).
 *
 * RAR creation is intentionally NOT offered: 7-Zip itself, and every
 * other freely licensable compressor, can only extract RAR — the RAR
 * write format is proprietary to WinRAR/RARLAB. This is a real format
 * constraint, not a gap in this implementation, and the UI states it
 * plainly rather than silently producing a mislabeled ZIP.
 */
import JSZip from "jszip";

let sevenZipPromise = null;

async function getSevenZip() {
  if (!sevenZipPromise) {
    sevenZipPromise = (async () => {
      const { default: SevenZip } = await import("7z-wasm");
      return SevenZip({
        locateFile: (path) => `/vendor/7z/${path}`,
      });
    })();
  }
  return sevenZipPromise;
}

function extOf(name) {
  return (name.split(".").pop() || "").toLowerCase();
}

/** Create a ZIP archive from one or more files (optionally under folder paths). */
export async function createZip(files, onProgress) {
  const zip = new JSZip();
  files.forEach((file) => {
    zip.file(file.relativePath || file.name, file);
  });
  const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } }, (meta) =>
    onProgress?.(meta.percent / 100)
  );
  return blob;
}

/** Extract a ZIP archive, returning [{name, blob}]. */
export async function extractZip(file, onProgress) {
  const zip = await JSZip.loadAsync(file);
  const entries = Object.values(zip.files).filter((f) => !f.dir);
  const outputs = [];
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const blob = await entry.async("blob");
    outputs.push({ name: entry.name, blob });
    onProgress?.((i + 1) / entries.length);
  }
  return outputs;
}

/**
 * Create a 7Z, TAR, or GZ archive using the real 7-Zip binary.
 * @param {File[]} files
 * @param {"7z"|"tar"|"gztar"} format
 */
export async function createArchive(files, format, onProgress) {
  const sz = await getSevenZip();
  const workDir = `/work-${Date.now()}`;
  sz.FS.mkdir(workDir);

  for (const file of files) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    sz.FS.writeFile(`${workDir}/${file.relativePath || file.name}`, bytes);
    onProgress?.(0.3 * (files.indexOf(file) + 1) / files.length);
  }

  const outputName =
    format === "7z" ? "output.7z" : format === "gztar" ? "output.tar.gz" : "output.tar";

  if (format === "gztar") {
    // 7-Zip's tar writer doesn't compress; the standard approach (matching
    // what `tar czf` does under the hood) is a plain tar followed by a
    // second pass through the gzip archiver.
    sz.callMain(["a", "-ttar", "/intermediate.tar", `${workDir}/*`]);
    sz.callMain(["a", "-tgzip", `/${outputName}`, "/intermediate.tar"]);
  } else {
    sz.callMain(["a", `-t${format === "7z" ? "7z" : "tar"}`, `/${outputName}`, `${workDir}/*`]);
  }

  onProgress?.(0.9);
  const data = sz.FS.readFile(`/${outputName}`);
  onProgress?.(1);

  const mimeMap = { "7z": "application/x-7z-compressed", tar: "application/x-tar", gztar: "application/gzip" };
  return new Blob([data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)], {
    type: mimeMap[format],
  });
}

/**
 * Extract a 7Z, RAR, TAR, or GZ archive using the real 7-Zip binary
 * (which can read all of these, including RAR, even though it can't
 * write RAR).
 */
export async function extractArchive(file, onProgress) {
  const sz = await getSevenZip();
  const ext = extOf(file.name);
  const inputName = `/input.${ext}`;
  const outDir = `/extracted-${Date.now()}`;

  const bytes = new Uint8Array(await file.arrayBuffer());
  sz.FS.writeFile(inputName, bytes);
  sz.FS.mkdir(outDir);
  onProgress?.(0.2);

  sz.callMain(["x", inputName, `-o${outDir}`, "-y"]);
  onProgress?.(0.8);

  const outputs = [];
  function walk(dir, prefix) {
    const entries = sz.FS.readdir(dir).filter((e) => e !== "." && e !== "..");
    for (const entry of entries) {
      const fullPath = `${dir}/${entry}`;
      const stat = sz.FS.stat(fullPath);
      if (sz.FS.isDir(stat.mode)) {
        walk(fullPath, `${prefix}${entry}/`);
      } else {
        const data = sz.FS.readFile(fullPath);
        outputs.push({
          name: `${prefix}${entry}`,
          blob: new Blob([data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)]),
        });
      }
    }
  }
  walk(outDir, "");
  onProgress?.(1);

  return outputs;
}

export const ARCHIVE_CAN_CREATE = ["zip", "7z", "tar", "gztar"];
export const ARCHIVE_CAN_EXTRACT = ["zip", "7z", "tar", "gz", "rar"];
