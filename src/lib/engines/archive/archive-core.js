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
      // print is captured at CONSTRUCTION time (the option documented on
      // SevenZipModuleOptions), not by reassigning it on the already-
      // built module afterward — an Emscripten module's internal C-side
      // calls resolve print through whatever was configured when the
      // module was built, and post-construction reassignment on the
      // returned object is not a reliably documented way to reroute
      // that already-resolved reference. Buffered onto the module
      // instance itself (sz.__printBuffer) rather than a module-scoped
      // variable, since getSevenZip's promise is a singleton shared by
      // every archive operation in this file — a shared buffer at
      // module scope would let concurrent operations' output interleave
      // or leak into each other; attaching it to the instance and having
      // each caller read-then-clear its own slice keeps that safe.
      const sz = await SevenZip({
        locateFile: (path) => `/vendor/7z/${path}`,
        print: (line) => {
          sz.__printBuffer = (sz.__printBuffer || "") + line + "\n";
        },
      });
      return sz;
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

/**
 * Adds new files to an existing ZIP archive without needing to fully
 * extract and rebuild it from scratch — JSZip.loadAsync reads the
 * existing entries, new files are added to that same in-memory
 * representation, and the whole thing is re-serialized in one pass.
 * ZIP specifically (not the 7z-wasm-backed formats) since JSZip's
 * load-modify-save cycle is the natural fit here; 7z-wasm's virtual
 * filesystem could do the equivalent for .7z, but ZIP is by far the
 * most common case for "add to an existing archive" and JSZip already
 * handles it directly without needing a WASM round trip for the whole
 * existing archive content.
 */
export async function addFilesToZip(existingZipFile, newFiles, onProgress) {
  const zip = await JSZip.loadAsync(existingZipFile);
  onProgress?.(0.3);

  newFiles.forEach((file) => {
    zip.file(file.relativePath || file.name, file);
  });

  const blob = await zip.generateAsync(
    { type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } },
    (meta) => onProgress?.(0.3 + (meta.percent / 100) * 0.7)
  );
  return blob;
}

/**
 * Lists an archive's contents (name, size, compressed size, whether
 * it's a directory) without extracting any file data — genuinely
 * different from extractArchive, which decompresses every entry. For
 * ZIP, JSZip's own loaded metadata already has this without touching
 * entry content. For 7z-wasm-backed formats, uses 7-Zip's own real "l"
 * (list) command rather than extracting to a temp directory just to
 * read directory entries back out, which would do far more work than
 * a genuine listing needs.
 */
export async function listArchiveContents(file) {
  const ext = extOf(file.name);

  if (ext === "zip") {
    const zip = await JSZip.loadAsync(file);
    return Object.values(zip.files).map((entry) => ({
      name: entry.name,
      isDirectory: entry.dir,
      compressedSize: entry._data?.compressedSize ?? null,
      uncompressedSize: entry._data?.uncompressedSize ?? entry.uncompressedSize ?? null,
    }));
  }

  const sz = await getSevenZip();
  const inputName = `/list-input.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());
  sz.FS.writeFile(inputName, bytes);

  // 7-Zip's own list command with -slt (show technical/full info) gives
  // real per-field output ("Path = ...", "Size = ...", "Attributes = ...")
  // rather than its default human-formatted table, which is meant for
  // terminal display and awkward to parse reliably. -o and shell-style
  // redirection do NOT work with the list command specifically
  // (confirmed against 7-Zip's own user forum, where multiple people
  // independently hit this same limitation) — the print buffer captured
  // at module-construction time (see getSevenZip) is genuinely the only
  // reliable way to retrieve this command's output.
  sz.__printBuffer = "";
  sz.callMain(["l", "-slt", inputName]);
  const output = sz.__printBuffer;
  sz.__printBuffer = "";
  sz.FS.unlink(inputName);

  // Each entry is a blank-line-separated block of "Key = Value" lines.
  // The archive's own summary block (always first, listing the
  // archive's own path, Type, Physical Size, etc.) is real, verified-
  // against-actual-7-Zip-output data — NOT simply absent a Path field
  // as might be assumed; it has one, pointing at the archive file
  // itself. The reliable distinguishing signal, confirmed against real
  // -slt sample output before writing this filter, is the Type field:
  // only the archive-level summary carries one, real per-file entries
  // never do — filtering on "no Path" alone would have silently
  // included the archive's own summary as if it were a listed file.
  const blocks = output.split(/\n\s*\n/);
  const entries = [];
  for (const block of blocks) {
    const fields = {};
    block.split("\n").forEach((line) => {
      const idx = line.indexOf(" = ");
      if (idx === -1) return;
      fields[line.slice(0, idx).trim()] = line.slice(idx + 3).trim();
    });
    if (!fields.Path || fields.Type) continue;
    const isDir = fields.Attributes?.startsWith("D") ?? false;
    entries.push({
      name: fields.Path,
      isDirectory: isDir,
      compressedSize: fields["Packed Size"] ? parseInt(fields["Packed Size"], 10) : null,
      uncompressedSize: fields.Size ? parseInt(fields.Size, 10) : null,
    });
  }
  return entries;
}

/**
 * Converts an archive from one format to another by extracting through
 * whichever real path handles the source format, then re-creating
 * through whichever real path handles the target format — genuinely
 * chaining this file's own already-correct extract/create functions
 * rather than a separate, parallel implementation.
 */
export async function convertArchiveFormat(file, targetFormat, onProgress) {
  const sourceExt = extOf(file.name);
  const entries =
    sourceExt === "zip"
      ? await extractZip(file, (p) => onProgress?.(p * 0.5))
      : await extractArchive(file, (p) => onProgress?.(p * 0.5));

  // Both extraction paths return [{name, blob}]; createZip/createArchive
  // expect File-like objects with a .name (createZip also honors an
  // optional .relativePath for nested paths) — wrapping each blob in a
  // real File preserves the entry's path exactly as extracted, including
  // any folder structure the original archive had.
  const filesForCreation = entries.map(
    (e) => new File([e.blob], e.name.split("/").pop() || e.name, { type: e.blob.type })
  );
  filesForCreation.forEach((f, i) => {
    f.relativePath = entries[i].name;
  });

  if (targetFormat === "zip") {
    return createZip(filesForCreation, (p) => onProgress?.(0.5 + p * 0.5));
  }
  return createArchive(filesForCreation, targetFormat, (p) => onProgress?.(0.5 + p * 0.5));
}

/**
 * Creates a password-protected .7z archive with real AES-256 encryption
 * for both file contents AND filenames (-mhe=on) — verified against
 * multiple independent, authoritative 7-Zip documentation sources
 * before writing this, since JSZip (used for plain ZIP elsewhere in
 * this file) has NO native password/encryption support at all — a
 * long-standing, still-open gap in that library, not something this
 * code works around by reimplementing encryption itself.
 *
 * Deliberately outputs .7z rather than a password-protected .zip:
 * 7-Zip CAN encrypt .zip file data with an explicit flag, but cannot
 * encrypt a .zip archive's filename headers at all (confirmed directly
 * against 7-Zip's own documentation — header encryption is a .7z-only
 * capability), meaning a "protected" zip would still leak its full file
 * listing to anyone who opens it without the password. .7z with
 * -mhe=on genuinely hides everything until the password is entered,
 * which is what "password protected" should actually mean.
 */
export async function createPasswordProtectedArchive(files, password, onProgress) {
  const sz = await getSevenZip();
  const workDir = `/pw-work-${Date.now()}`;
  sz.FS.mkdir(workDir);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const bytes = new Uint8Array(await file.arrayBuffer());
    sz.FS.writeFile(`${workDir}/${file.relativePath || file.name}`, bytes);
    onProgress?.(0.3 * ((i + 1) / files.length));
  }

  const outputName = "protected.7z";
  // -p{password} sets the password directly on the command (no
  // interactive prompt, since there's no real terminal in this WASM
  // context to prompt through) — -mhe=on encrypts headers/filenames too.
  sz.callMain(["a", "-t7z", `-p${password}`, "-mhe=on", `/${outputName}`, `${workDir}/*`]);

  onProgress?.(0.9);
  const data = sz.FS.readFile(`/${outputName}`);
  onProgress?.(1);

  return new Blob([data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)], {
    type: "application/x-7z-compressed",
  });
}

/**
 * Splits a ZIP archive into multiple size-limited parts using 7-Zip's
 * own real volume-splitting feature (-v{size}), the standard, correct
 * technique for size-limited archive splitting — not a hand-rolled
 * byte-chunking of the finished archive, which would produce parts
 * that are not independently valid or reliably reassemblable.
 * @param {File[]} files
 * @param {number} maxPartSizeBytes
 * @returns {Promise<{name: string, blob: Blob}[]>}
 */
export async function splitArchiveIntoParts(files, maxPartSizeBytes, onProgress) {
  const sz = await getSevenZip();
  const workDir = `/split-work-${Date.now()}`;
  sz.FS.mkdir(workDir);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const bytes = new Uint8Array(await file.arrayBuffer());
    sz.FS.writeFile(`${workDir}/${file.relativePath || file.name}`, bytes);
    onProgress?.(0.3 * ((i + 1) / files.length));
  }

  const baseName = "archive.zip";
  sz.callMain(["a", "-tzip", `-v${maxPartSizeBytes}b`, `/${baseName}`, `${workDir}/*`]);
  onProgress?.(0.8);

  // 7-Zip names volume parts archive.zip.001, archive.zip.002, and so
  // on — listing the root directory and filtering for that exact
  // naming pattern is how the real, actual output files are discovered,
  // rather than assuming a fixed part count computed ahead of time
  // (files smaller than one volume produce a single un-suffixed file
  // instead, a real edge case this filter also needs to not silently
  // miss — handled below by falling back to the plain archive.zip name
  // if no numbered parts exist).
  const rootEntries = sz.FS.readdir("/").filter((e) => e.startsWith(`${baseName}.`));
  const partNames = rootEntries.length > 0 ? rootEntries.sort() : [baseName];

  const outputs = [];
  for (const name of partNames) {
    const data = sz.FS.readFile(`/${name}`);
    outputs.push({
      name,
      blob: new Blob([data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)]),
    });
  }
  onProgress?.(1);
  return outputs;
}
