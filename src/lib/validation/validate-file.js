/**
 * Client-side file validation for the Dropzone's "Validating" state.
 * Runs before a file is queued so the person gets clear, specific error
 * copy immediately rather than discovering a mismatch after processing
 * has already started.
 */

const EXTENSION_MIME_HINTS = {
  ".pdf": ["application/pdf"],
  ".docx": ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  ".doc": ["application/msword"],
  ".xlsx": ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
  ".xls": ["application/vnd.ms-excel"],
  ".csv": ["text/csv"],
  ".pptx": ["application/vnd.openxmlformats-officedocument.presentationml.presentation"],
  ".txt": ["text/plain"],
  ".md": ["text/markdown", "text/plain"],
  ".markdown": ["text/markdown", "text/plain"],
  ".html": ["text/html"],
  ".htm": ["text/html"],
  ".zip": ["application/zip", "application/x-zip-compressed"],
  ".rar": ["application/vnd.rar", "application/x-rar-compressed"],
  ".7z": ["application/x-7z-compressed"],
  ".tar": ["application/x-tar"],
  ".gz": ["application/gzip"],
};

// Default per-tool max size; individual tools can override via the
// registry if a specific operation needs a different ceiling (e.g. video
// tools allow larger uploads than a simple PDF page-number tool).
const DEFAULT_MAX_SIZE_BYTES = 200 * 1024 * 1024; // 200MB — generous for a
// browser-only pipeline; ffmpeg.wasm/tesseract.js/pdf-lib all operate
// in-memory, so this exists to protect the person's own browser tab from
// running out of memory, not an artificial server-side limit.

function getExtension(filename) {
  const idx = filename.lastIndexOf(".");
  return idx === -1 ? "" : filename.slice(idx).toLowerCase();
}

/**
 * @param {File} file
 * @param {string[]} accepts e.g. ["application/pdf"] or [".docx"] or ["image/*"] or ["*"]
 * @param {number} [maxSizeBytes]
 * @returns {{valid: boolean, error?: string}}
 */
export function validateFile(file, accepts, maxSizeBytes = DEFAULT_MAX_SIZE_BYTES) {
  if (file.size === 0) {
    return { valid: false, error: `"${file.name}" is empty (0 bytes) and can't be processed.` };
  }
  if (file.size > maxSizeBytes) {
    const maxMb = Math.round(maxSizeBytes / (1024 * 1024));
    return {
      valid: false,
      error: `"${file.name}" is ${(file.size / (1024 * 1024)).toFixed(1)}MB, which is over the ${maxMb}MB limit for this tool.`,
    };
  }

  if (!accepts || accepts.includes("*")) return { valid: true };

  const ext = getExtension(file.name);
  const mimeOk = accepts.some((a) => {
    if (a.endsWith("/*")) return file.type.startsWith(a.replace("/*", "/"));
    if (a.startsWith(".")) return ext === a;
    return file.type === a;
  });

  if (mimeOk) return { valid: true };

  // Fall back to extension-based hinting for files where the browser
  // reported an empty or generic MIME type (common for less-common
  // formats on some OSes), rather than rejecting a genuinely valid file.
  const hinted = EXTENSION_MIME_HINTS[ext];
  if (hinted && accepts.some((a) => hinted.includes(a))) return { valid: true };

  const expected = accepts.join(", ");
  return {
    valid: false,
    error: `"${file.name}" doesn't look like a supported file for this tool (expected ${expected}).`,
  };
}

export function validateFiles(files, accepts, options = {}) {
  const results = files.map((file) => ({ file, ...validateFile(file, accepts, options.maxSizeBytes) }));
  return {
    valid: results.filter((r) => r.valid).map((r) => r.file),
    errors: results.filter((r) => !r.valid),
  };
}

export function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}
