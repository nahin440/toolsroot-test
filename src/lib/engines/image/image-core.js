"use client";

/**
 * Core image engine. Uses the browser's native canvas encode/decode for
 * PNG/JPEG/WEBP/BMP (universally supported) and AVIF (supported in all
 * current Chrome/Firefox/Edge), heic2any for HEIC/HEIF (which no browser
 * can decode natively), and a hand-rolled minimal ICO encoder/decoder
 * since no browser can read or write .ico directly.
 */
import heic2any from "heic2any";

const CANVAS_MIME = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  bmp: "image/bmp",
  avif: "image/avif",
};

async function loadImageBitmapFromFile(file) {
  const ext = (file.name.split(".").pop() || "").toLowerCase();

  if (ext === "heic" || ext === "heif" || file.type === "image/heic" || file.type === "image/heif") {
    const converted = await heic2any({ blob: file, toType: "image/png", quality: 0.95 });
    const blob = Array.isArray(converted) ? converted[0] : converted;
    return createImageBitmap(blob);
  }

  if (ext === "ico") {
    return loadIcoAsImageBitmap(file);
  }

  if (ext === "svg" || file.type === "image/svg+xml") {
    return loadSvgAsImageBitmap(file);
  }

  return createImageBitmap(file);
}

/**
 * Reads an SVG's real intended pixel size directly from its markup, since
 * relying on the rendered <img> naturalWidth/Height means any SVG that
 * declares only a viewBox (a very common, spec-recommended pattern for
 * scalable icons and logos) reports the CSS-spec fallback of 300x150
 * regardless of its real aspect ratio, silently distorting the output.
 * Falls back to that same 300x150 only when the file truly has no size
 * information of any kind to read.
 */
function getSvgIntrinsicSize(svgText) {
  const widthMatch = svgText.match(/\bwidth\s*=\s*["']([\d.]+)(?:px)?["']/i);
  const heightMatch = svgText.match(/\bheight\s*=\s*["']([\d.]+)(?:px)?["']/i);
  if (widthMatch && heightMatch) {
    const w = parseFloat(widthMatch[1]);
    const h = parseFloat(heightMatch[1]);
    if (w > 0 && h > 0) return { width: w, height: h };
  }

  const viewBoxMatch = svgText.match(/\bviewBox\s*=\s*["']([^"']+)["']/i);
  if (viewBoxMatch) {
    const parts = viewBoxMatch[1].trim().split(/[\s,]+/).map(Number);
    if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
      // Scale up small viewBoxes (icon-sized, e.g. 24x24) to a print-usable
      // resolution, since rasterizing at 24px would produce an unusably
      // tiny, blurry PNG for what's meant to be a scalable graphic.
      const [, , vbW, vbH] = parts;
      const scale = vbW < 512 ? Math.min(4, 512 / vbW) : 1;
      return { width: Math.round(vbW * scale), height: Math.round(vbH * scale) };
    }
  }

  return { width: 1200, height: 600 };
}

async function loadSvgAsImageBitmap(file) {
  const text = await file.text();
  const svgBlob = new Blob([text], { type: "image/svg+xml" });
  const url = URL.createObjectURL(svgBlob);
  try {
    const { width: w, height: h } = getSvgIntrinsicSize(text);
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvas.getContext("2d").drawImage(img, 0, 0, w, h);
    return createImageBitmap(canvas);
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Minimal ICO parser: reads the first (largest) image entry as PNG or BMP-in-ICO. */
async function loadIcoAsImageBitmap(file) {
  const buf = new Uint8Array(await file.arrayBuffer());
  const view = new DataView(buf.buffer);
  const count = view.getUint16(4, true);
  let best = null;
  for (let i = 0; i < count; i++) {
    const off = 6 + i * 16;
    const width = buf[off] || 256;
    const height = buf[off + 1] || 256;
    const size = view.getUint32(off + 8, true);
    const offset = view.getUint32(off + 12, true);
    if (!best || width * height > best.width * best.height) {
      best = { width, height, size, offset };
    }
  }
  if (!best) throw new Error("This .ico file doesn't contain any readable images.");
  const entryBytes = buf.slice(best.offset, best.offset + best.size);
  const isPng = entryBytes[0] === 0x89 && entryBytes[1] === 0x50;
  const blob = new Blob([entryBytes], { type: isPng ? "image/png" : "image/bmp" });
  if (isPng) return createImageBitmap(blob);
  return decodeIcoBmpEntry(entryBytes, best.width, best.height);
}

function decodeIcoBmpEntry(bytes, width, height) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const bpp = view.getUint16(14, true);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  const imageData = ctx.createImageData(width, height);

  if (bpp === 32) {
    const pixelDataOffset = 40;
    for (let y = 0; y < height; y++) {
      const srcRow = height - 1 - y;
      for (let x = 0; x < width; x++) {
        const srcIdx = pixelDataOffset + (srcRow * width + x) * 4;
        const dstIdx = (y * width + x) * 4;
        imageData.data[dstIdx] = bytes[srcIdx + 2];
        imageData.data[dstIdx + 1] = bytes[srcIdx + 1];
        imageData.data[dstIdx + 2] = bytes[srcIdx];
        imageData.data[dstIdx + 3] = bytes[srcIdx + 3];
      }
    }
  }
  ctx.putImageData(imageData, 0, 0);
  return createImageBitmap(canvas);
}

/** Encodes a canvas as a valid single-image .ico file (BMP-in-ICO format, universally supported by OSes). */
function canvasToIcoBytes(canvas) {
  const ctx = canvas.getContext("2d");
  const { width, height } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height);

  const dibHeaderSize = 40;
  const pixelDataSize = width * height * 4;
  const andMaskRowSize = Math.ceil(width / 32) * 4;
  const andMaskSize = andMaskRowSize * height;
  const dibSize = dibHeaderSize + pixelDataSize + andMaskSize;
  const icoHeaderSize = 6 + 16;
  const totalSize = icoHeaderSize + dibSize;

  const buf = new ArrayBuffer(totalSize);
  const view = new DataView(buf);
  const bytes = new Uint8Array(buf);

  view.setUint16(0, 0, true);
  view.setUint16(2, 1, true);
  view.setUint16(4, 1, true);

  bytes[6] = width >= 256 ? 0 : width;
  bytes[7] = height >= 256 ? 0 : height;
  bytes[8] = 0;
  bytes[9] = 0;
  view.setUint16(10, 1, true);
  view.setUint16(12, 32, true);
  view.setUint32(14, dibSize, true);
  view.setUint32(18, icoHeaderSize, true);

  const dibOffset = icoHeaderSize;
  view.setUint32(dibOffset, dibHeaderSize, true);
  view.setInt32(dibOffset + 4, width, true);
  view.setInt32(dibOffset + 8, height * 2, true);
  view.setUint16(dibOffset + 12, 1, true);
  view.setUint16(dibOffset + 14, 32, true);
  view.setUint32(dibOffset + 16, 0, true);
  view.setUint32(dibOffset + 20, pixelDataSize, true);

  const pixelOffset = dibOffset + dibHeaderSize;
  for (let y = 0; y < height; y++) {
    const srcRow = height - 1 - y;
    for (let x = 0; x < width; x++) {
      const srcIdx = (srcRow * width + x) * 4;
      const dstIdx = pixelOffset + (y * width + x) * 4;
      bytes[dstIdx] = imageData.data[srcIdx + 2];
      bytes[dstIdx + 1] = imageData.data[srcIdx + 1];
      bytes[dstIdx + 2] = imageData.data[srcIdx];
      bytes[dstIdx + 3] = imageData.data[srcIdx + 3];
    }
  }

  return bytes;
}

/**
 * @param {string|null} [backgroundColor] When set, painted as an opaque fill
 *   before the bitmap is drawn, so any transparent source pixels flatten
 *   onto this color instead of an implementation-dependent default. Needed
 *   specifically when the *target* format has no alpha channel (JPG, BMP):
 *   per the canvas spec, encoding a transparent canvas to those formats
 *   should composite onto black, but real browsers have historically
 *   disagreed (Safari has used white, IE black, older Firefox/Chrome
 *   unpremultiplied) — pre-filling removes that ambiguity outright.
 *   Left null (the default) for every format that supports alpha, so
 *   transparency-preserving conversions are completely unaffected.
 */
function drawToCanvas(bitmap, targetW, targetH, backgroundColor = null) {
  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  if (backgroundColor) {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, targetW, targetH);
  }
  ctx.drawImage(bitmap, 0, 0, targetW, targetH);
  return canvas;
}

// Target formats with no alpha channel — transparency must be flattened
// onto a solid color before encoding, or the result is browser-dependent.
const OPAQUE_ONLY_FORMATS = new Set(["jpg", "jpeg", "bmp"]);

/**
 * Encodes a canvas to the given format, used by every operation that
 * derives its output format from the source file's own extension
 * (resize/crop/rotate-flip/watermark all preserve the original format).
 * Routes BMP through the reliable hand-rolled encoder (see
 * canvasToBmpBytes' doc comment for why canvas.toBlob can't be trusted
 * for BMP) and validates the real returned type for everything else, so
 * a browser silently substituting PNG for an unsupported format is
 * caught rather than mislabeling the output.
 */
async function encodeCanvasSafely(canvas, format, quality) {
  if (format === "bmp") {
    return new Blob([canvasToBmpBytes(canvas)], { type: "image/bmp" });
  }
  const mime = CANVAS_MIME[format] || "image/png";
  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Encoding failed."))), mime, quality);
  });
  if (blob.type !== mime) {
    throw new Error(`Your browser doesn't support encoding ${format.toUpperCase()} images.`);
  }
  return blob;
}

/**
 * Encodes a canvas as a real, standard 32bpp BMP file directly, since
 * canvas.toBlob('image/bmp') is NOT part of the HTML5 Canvas spec (only
 * PNG is spec-guaranteed) and Safari does not support BMP output at all
 * via toBlob — this would otherwise make "Convert to BMP" silently fail
 * or mislabel a PNG as BMP for a meaningful share of real users. BMP's
 * format is simple and well-documented enough to encode directly and
 * reliably, the same reasoning already applied to the ICO encoder below.
 */
function canvasToBmpBytes(canvas) {
  const ctx = canvas.getContext("2d");
  const { width, height } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height);

  const rowSize = width * 4; // 32bpp, no padding needed since width*4 is always a multiple of 4
  const pixelDataSize = rowSize * height;
  const fileHeaderSize = 14;
  const dibHeaderSize = 40;
  const totalSize = fileHeaderSize + dibHeaderSize + pixelDataSize;

  const buf = new ArrayBuffer(totalSize);
  const view = new DataView(buf);
  const bytes = new Uint8Array(buf);

  // BITMAPFILEHEADER
  bytes[0] = 0x42; // 'B'
  bytes[1] = 0x4d; // 'M'
  view.setUint32(2, totalSize, true);
  view.setUint32(6, 0, true); // reserved
  view.setUint32(10, fileHeaderSize + dibHeaderSize, true); // pixel data offset

  // BITMAPINFOHEADER
  view.setUint32(14, dibHeaderSize, true);
  view.setInt32(18, width, true);
  view.setInt32(22, height, true); // positive = bottom-up row order
  view.setUint16(26, 1, true); // planes
  view.setUint16(28, 32, true); // bpp
  view.setUint32(30, 0, true); // no compression
  view.setUint32(34, pixelDataSize, true);
  view.setInt32(38, 2835, true); // ~72 DPI
  view.setInt32(42, 2835, true);
  view.setUint32(46, 0, true); // colors used
  view.setUint32(50, 0, true); // important colors

  const pixelOffset = fileHeaderSize + dibHeaderSize;
  for (let y = 0; y < height; y++) {
    const srcRow = height - 1 - y; // BMP rows are bottom-up
    for (let x = 0; x < width; x++) {
      const srcIdx = (srcRow * width + x) * 4;
      const dstIdx = pixelOffset + y * rowSize + x * 4;
      bytes[dstIdx] = imageData.data[srcIdx + 2]; // B
      bytes[dstIdx + 1] = imageData.data[srcIdx + 1]; // G
      bytes[dstIdx + 2] = imageData.data[srcIdx]; // R
      bytes[dstIdx + 3] = imageData.data[srcIdx + 3]; // A
    }
  }

  return bytes;
}

/**
 * @param {File} file
 * @param {"png"|"jpg"|"webp"|"avif"|"bmp"|"ico"} targetFormat
 * @param {{quality?: number}} [opts] quality 0-1, ignored for lossless formats
 */
export async function convertImage(file, targetFormat, opts = {}) {
  const bitmap = await loadImageBitmapFromFile(file);
  const backgroundColor = OPAQUE_ONLY_FORMATS.has(targetFormat) ? "#ffffff" : null;
  const canvas = drawToCanvas(bitmap, bitmap.width, bitmap.height, backgroundColor);

  if (targetFormat === "ico") {
    const icoBytes = canvasToIcoBytes(canvas);
    return new Blob([icoBytes], { type: "image/x-icon" });
  }

  if (targetFormat === "bmp") {
    const bmpBytes = canvasToBmpBytes(canvas);
    return new Blob([bmpBytes], { type: "image/bmp" });
  }

  const mime = CANVAS_MIME[targetFormat];
  if (!mime) throw new Error(`Unsupported target format: ${targetFormat}`);

  const quality = targetFormat === "png" ? undefined : opts.quality ?? 0.9;
  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error(`Your browser couldn't encode ${targetFormat.toUpperCase()}.`))),
      mime,
      quality
    );
  });

  // canvas.toBlob is only spec-guaranteed to support PNG — JPEG/WebP are
  // near-universal in practice. When a browser doesn't support the
  // requested type, toBlob silently substitutes PNG instead of
  // erroring, which would otherwise let a person download a file
  // mislabeled with the wrong format. Checking the real returned type
  // catches this rather than silently mislabeling the output.
  if (blob.type !== mime) {
    throw new Error(
      `Your browser doesn't support encoding ${targetFormat.toUpperCase()} images. Try WEBP or PNG instead.`
    );
  }

  return blob;
}

/**
 * Compress an image, keeping its original format when that format has a
 * real adjustable-quality encoder available (PNG, JPG, WEBP, BMP, AVIF).
 * Formats with no quality axis of their own to compress along — GIF (fixed
 * 256-color palette), TIFF and SVG (not encodable back out by this engine),
 * ICO and HEIC (single-purpose containers, not general photo formats) — are
 * re-encoded as JPG instead, since that's the only way to meaningfully
 * shrink them here. This is a real format change, not merely a smaller
 * version of the original, which is why it's called out explicitly rather
 * than left as a silent fallback.
 */
export async function compressImage(file, opts = {}) {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const normalizedExt = ext === "jpeg" ? "jpg" : ext;
  const preservableFormats = ["png", "jpg", "webp", "bmp", "avif"];
  const format = preservableFormats.includes(normalizedExt) ? normalizedExt : "jpg";

  // BMP has no lossy quality axis of its own — it's always uncompressed
  // 32bpp — so "compressing" it means re-encoding as JPG instead, the same
  // honest-format-change reasoning documented above. Routed through the
  // shared jpg encode path below (mime/quality/maxSizeBytes) rather than a
  // separate early return, so a future maxSizeBytes ceiling still applies.
  const encodeFormat = format === "bmp" ? "jpg" : format;
  const mime = CANVAS_MIME[encodeFormat];

  const bitmap = await loadImageBitmapFromFile(file);
  const backgroundColor = OPAQUE_ONLY_FORMATS.has(encodeFormat) ? "#ffffff" : null;
  const canvas = drawToCanvas(bitmap, bitmap.width, bitmap.height, backgroundColor);

  if (encodeFormat === "png") {
    return new Promise((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("PNG encoding failed."))), mime);
    });
  }

  let quality = opts.quality ?? 0.75;
  let blob = await new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Encoding failed."))), mime, quality);
  });

  // Same browser-substitution guard used by encodeCanvasSafely and
  // convertImage above — canvas.toBlob silently returns PNG instead of
  // erroring when the browser can't encode the requested type, which
  // matters here now that compressImage can target AVIF, not just the
  // near-universal JPG/WEBP it originally handled.
  if (blob.type !== mime) {
    throw new Error(`Your browser doesn't support encoding ${encodeFormat.toUpperCase()} images.`);
  }

  if (opts.maxSizeBytes) {
    let attempts = 0;
    while (blob.size > opts.maxSizeBytes && quality > 0.1 && attempts < 8) {
      quality -= 0.1;
      blob = await new Promise((resolve, reject) => {
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Encoding failed."))), mime, quality);
      });
      attempts++;
    }
  }

  return blob;
}

/** @param {{mode: "exact"|"percentage", width?, height?, percentage?, maintainAspectRatio?}} opts */
export async function resizeImage(file, opts) {
  const bitmap = await loadImageBitmapFromFile(file);
  let targetW;
  let targetH;

  if (opts.mode === "percentage") {
    targetW = Math.round(bitmap.width * (opts.percentage / 100));
    targetH = Math.round(bitmap.height * (opts.percentage / 100));
  } else {
    targetW = opts.width || bitmap.width;
    targetH = opts.height || bitmap.height;
    if (opts.maintainAspectRatio) {
      const ratio = bitmap.width / bitmap.height;
      if (opts.width && !opts.height) targetH = Math.round(opts.width / ratio);
      else if (opts.height && !opts.width) targetW = Math.round(opts.height * ratio);
      else targetH = Math.round(targetW / ratio);
    }
  }

  const canvas = drawToCanvas(bitmap, targetW, targetH);
  const ext = (file.name.split(".").pop() || "png").toLowerCase();
  const format = CANVAS_MIME[ext] || ext === "bmp" ? ext : "png";
  return encodeCanvasSafely(canvas, format, 0.92);
}

/** @param {{x, y, width, height}} cropBox in source-image pixel coordinates */
export async function cropImage(file, cropBox) {
  const bitmap = await loadImageBitmapFromFile(file);
  const canvas = document.createElement("canvas");
  canvas.width = cropBox.width;
  canvas.height = cropBox.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(bitmap, cropBox.x, cropBox.y, cropBox.width, cropBox.height, 0, 0, cropBox.width, cropBox.height);
  const ext = (file.name.split(".").pop() || "png").toLowerCase();
  const format = CANVAS_MIME[ext] || ext === "bmp" ? ext : "png";
  return encodeCanvasSafely(canvas, format, 0.92);
}

/** @param {number} rotationDeg 0/90/180/270. @param {{horizontal?, vertical?}} flip */
export async function rotateFlipImage(file, rotationDeg = 0, flip = {}) {
  const bitmap = await loadImageBitmapFromFile(file);
  const swapDims = rotationDeg === 90 || rotationDeg === 270;
  const canvas = document.createElement("canvas");
  canvas.width = swapDims ? bitmap.height : bitmap.width;
  canvas.height = swapDims ? bitmap.width : bitmap.height;
  const ctx = canvas.getContext("2d");

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((rotationDeg * Math.PI) / 180);
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
  ctx.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2);

  const ext = (file.name.split(".").pop() || "png").toLowerCase();
  const format = CANVAS_MIME[ext] || ext === "bmp" ? ext : "png";
  return encodeCanvasSafely(canvas, format, 0.92);
}

/**
 * @param {object} opts { type: "text"|"image", text, imageFile, opacity,
 *   rotationDeg, fontSize, color: "#rrggbb", position: "center"|"tiled"|"corner" }
 */
export async function watermarkImage(file, opts) {
  const bitmap = await loadImageBitmapFromFile(file);
  const canvas = drawToCanvas(bitmap, bitmap.width, bitmap.height);
  const ctx = canvas.getContext("2d");
  ctx.globalAlpha = opts.opacity ?? 0.35;

  if (opts.type === "text" && opts.text) {
    const fontSize = opts.fontSize || Math.round(bitmap.width * 0.06);
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.fillStyle = opts.color || "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(((opts.rotationDeg ?? -30) * Math.PI) / 180);

    if (opts.position === "tiled") {
      const metrics = ctx.measureText(opts.text);
      const stepX = metrics.width + fontSize * 2;
      const stepY = fontSize * 3;
      for (let y = -canvas.height; y < canvas.height; y += stepY) {
        for (let x = -canvas.width; x < canvas.width; x += stepX) {
          ctx.fillText(opts.text, x, y);
        }
      }
    } else {
      ctx.fillText(opts.text, 0, 0);
    }
    ctx.restore();
  } else if (opts.type === "image" && opts.imageFile) {
    const wmBitmap = await createImageBitmap(opts.imageFile);
    const scale = opts.imageScale || 0.25;
    const wmW = bitmap.width * scale;
    const wmH = wmBitmap.height * (wmW / wmBitmap.width);
    const x = opts.position === "corner" ? canvas.width - wmW - 24 : (canvas.width - wmW) / 2;
    const y = opts.position === "corner" ? canvas.height - wmH - 24 : (canvas.height - wmH) / 2;
    ctx.drawImage(wmBitmap, x, y, wmW, wmH);
  }

  ctx.globalAlpha = 1;
  const ext = (file.name.split(".").pop() || "png").toLowerCase();
  const format = CANVAS_MIME[ext] || ext === "bmp" ? ext : "png";
  return encodeCanvasSafely(canvas, format, 0.92);
}

/** Reads basic + EXIF-presence metadata by scanning JPEG APP1 segments directly. */
export async function readImageMetadata(file) {
  const bitmap = await loadImageBitmapFromFile(file);
  const basic = {
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
    width: bitmap.width,
    height: bitmap.height,
  };

  if (!/jpe?g/i.test(file.type) && !/\.jpe?g$/i.test(file.name)) {
    return { ...basic, exif: null, hasExif: false };
  }

  const buf = new Uint8Array(await file.slice(0, 128 * 1024).arrayBuffer());
  const view = new DataView(buf.buffer);
  if (view.getUint16(0) !== 0xffd8) return { ...basic, exif: null, hasExif: false };

  let offset = 2;
  let exifFound = false;

  while (offset < buf.length - 4) {
    const marker = view.getUint16(offset);
    if ((marker & 0xff00) !== 0xff00) break;
    if (marker === 0xffe1) {
      const segLength = view.getUint16(offset + 2);
      const exifHeader = String.fromCharCode(...buf.slice(offset + 4, offset + 10));
      if (exifHeader.startsWith("Exif")) exifFound = true;
      offset += 2 + segLength;
    } else if (marker === 0xffda) {
      break;
    } else {
      const segLength = view.getUint16(offset + 2);
      offset += 2 + segLength;
    }
  }

  return { ...basic, exif: exifFound ? {} : null, hasExif: exifFound };
}

/** Strips all metadata by re-encoding through canvas (canvas never preserves EXIF/XMP/ICC on output). */
export async function stripImageMetadata(file) {
  const bitmap = await loadImageBitmapFromFile(file);
  const canvas = drawToCanvas(bitmap, bitmap.width, bitmap.height);
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const format = CANVAS_MIME[ext] ? ext : "jpg";
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Encoding failed."))), CANVAS_MIME[format], 0.95);
  });
}

export { loadImageBitmapFromFile, drawToCanvas };
