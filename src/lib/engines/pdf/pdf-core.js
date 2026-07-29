"use client";

/**
 * Core PDF manipulation operations. All operate on real PDF structure via
 * @cantoo/pdf-lib (a pdf-lib fork with genuine encryption support — see
 * password-protection.js) — no operation here is a stub or placeholder.
 */
import { PDFDocument, degrees, rgb, StandardFonts, PageSizes } from "@cantoo/pdf-lib";

async function loadDoc(fileOrBytes) {
  const bytes = fileOrBytes instanceof ArrayBuffer ? fileOrBytes : await fileOrBytes.arrayBuffer();
  return PDFDocument.load(bytes, { ignoreEncryption: false });
}

/** Merge multiple PDFs into one, in the given order. */
export async function mergePdfs(files, onProgress) {
  const outDoc = await PDFDocument.create();
  for (let i = 0; i < files.length; i++) {
    const srcDoc = await loadDoc(files[i]);
    const pageIndices = srcDoc.getPageIndices();
    const copiedPages = await outDoc.copyPages(srcDoc, pageIndices);
    copiedPages.forEach((p) => outDoc.addPage(p));
    onProgress?.((i + 1) / files.length);
  }
  const bytes = await outDoc.save();
  return new Blob([bytes], { type: "application/pdf" });
}

/**
 * Split a PDF according to a mode:
 *  - "every-page": one output file per page
 *  - "ranges": array of {from, to} 1-indexed inclusive ranges, one file per range
 *  - "every-n": one file per N pages
 */
export async function splitPdf(file, mode, options = {}, onProgress) {
  const srcDoc = await loadDoc(file);
  const totalPages = srcDoc.getPageCount();
  const outputs = [];

  let ranges = [];
  if (mode === "every-page") {
    ranges = Array.from({ length: totalPages }, (_, i) => ({ from: i + 1, to: i + 1 }));
  } else if (mode === "every-n") {
    const n = Math.max(1, options.everyN || 1);
    for (let start = 1; start <= totalPages; start += n) {
      ranges.push({ from: start, to: Math.min(start + n - 1, totalPages) });
    }
  } else if (mode === "ranges") {
    ranges = options.ranges || [];
  }

  for (let i = 0; i < ranges.length; i++) {
    const { from, to } = ranges[i];
    const outDoc = await PDFDocument.create();
    const indices = [];
    for (let p = from; p <= to; p++) indices.push(p - 1);
    const copied = await outDoc.copyPages(srcDoc, indices);
    copied.forEach((p) => outDoc.addPage(p));
    const bytes = await outDoc.save();
    outputs.push({
      blob: new Blob([bytes], { type: "application/pdf" }),
      name: `pages-${from}${to !== from ? `-${to}` : ""}.pdf`,
    });
    onProgress?.((i + 1) / ranges.length);
  }

  return outputs;
}

/** Rotate all or a subset of pages by a given angle (90/180/270). */
export async function rotatePdf(file, angle, pageNumbers = null) {
  const doc = await loadDoc(file);
  const pages = doc.getPages();
  const targets = pageNumbers ? pageNumbers.map((n) => n - 1) : pages.map((_, i) => i);

  targets.forEach((idx) => {
    const page = pages[idx];
    if (!page) return;
    const current = page.getRotation().angle;
    page.setRotation(degrees((current + angle) % 360));
  });

  const bytes = await doc.save();
  return new Blob([bytes], { type: "application/pdf" });
}

/** Delete the given 1-indexed page numbers from a PDF. */
export async function deletePages(file, pageNumbers) {
  const doc = await loadDoc(file);
  const toDelete = new Set(pageNumbers);
  const sorted = [...toDelete].sort((a, b) => b - a);
  for (const pageNum of sorted) {
    doc.removePage(pageNum - 1);
  }
  const bytes = await doc.save();
  return new Blob([bytes], { type: "application/pdf" });
}

/** Extract the given 1-indexed page numbers into a new PDF. */
export async function extractPages(file, pageNumbers) {
  const srcDoc = await loadDoc(file);
  const outDoc = await PDFDocument.create();
  const indices = pageNumbers.map((n) => n - 1);
  const copied = await outDoc.copyPages(srcDoc, indices);
  copied.forEach((p) => outDoc.addPage(p));
  const bytes = await outDoc.save();
  return new Blob([bytes], { type: "application/pdf" });
}

/** Rearrange pages into a new order given an ordered array of 1-indexed source page numbers. */
export async function rearrangePages(file, newOrder) {
  const srcDoc = await loadDoc(file);
  const outDoc = await PDFDocument.create();
  const indices = newOrder.map((n) => n - 1);
  const copied = await outDoc.copyPages(srcDoc, indices);
  copied.forEach((p) => outDoc.addPage(p));
  const bytes = await outDoc.save();
  return new Blob([bytes], { type: "application/pdf" });
}

/**
 * Stamp a text or image watermark across every page.
 * @param {object} opts { type: "text"|"image", text, imageBytes, imageExt,
 *   opacity (0-1), rotationDeg, fontSize, color: {r,g,b} 0-1, position: "center"|"tiled" }
 */
export async function watermarkPdf(file, opts) {
  const doc = await loadDoc(file);
  const pages = doc.getPages();
  const font = await doc.embedFont(StandardFonts.HelveticaBold);

  let image;
  if (opts.type === "image" && opts.imageBytes) {
    image = /png/i.test(opts.imageExt) ? await doc.embedPng(opts.imageBytes) : await doc.embedJpg(opts.imageBytes);
  }

  for (const page of pages) {
    const { width, height } = page.getSize();
    const opacity = opts.opacity ?? 0.3;
    const rotation = opts.rotationDeg ?? -45;

    if (opts.type === "text" && opts.text) {
      const fontSize = opts.fontSize || 48;
      const textWidth = font.widthOfTextAtSize(opts.text, fontSize);
      const color = opts.color ? rgb(opts.color.r, opts.color.g, opts.color.b) : rgb(0.5, 0.5, 0.5);

      if (opts.position === "tiled") {
        const stepX = textWidth + 80;
        const stepY = fontSize + 80;
        for (let y = -stepY; y < height + stepY; y += stepY) {
          for (let x = -stepX; x < width + stepX; x += stepX) {
            page.drawText(opts.text, { x, y, size: fontSize, font, color, opacity, rotate: degrees(rotation) });
          }
        }
      } else {
        page.drawText(opts.text, {
          x: (width - textWidth) / 2,
          y: height / 2,
          size: fontSize,
          font,
          color,
          opacity,
          rotate: degrees(rotation),
        });
      }
    } else if (image) {
      const scale = opts.imageScale || 0.4;
      const imgDims = image.scale(scale * (width / image.width));
      page.drawImage(image, {
        x: (width - imgDims.width) / 2,
        y: (height - imgDims.height) / 2,
        width: imgDims.width,
        height: imgDims.height,
        opacity,
        rotate: degrees(rotation),
      });
    }
  }

  const bytes = await doc.save();
  return new Blob([bytes], { type: "application/pdf" });
}

/**
 * Add page numbers.
 * @param {object} opts { position, startAt, format: "n"|"n-of-total"|"page-n", fontSize }
 */
export async function numberPages(file, opts = {}) {
  const doc = await loadDoc(file);
  const pages = doc.getPages();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontSize = opts.fontSize || 10;
  const startAt = opts.startAt ?? 1;
  const margin = 28;

  pages.forEach((page, idx) => {
    const num = startAt + idx;
    const total = pages.length;
    let text;
    if (opts.format === "n-of-total") text = `${num} of ${total}`;
    else if (opts.format === "page-n") text = `Page ${num}`;
    else text = `${num}`;

    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    const pos = opts.position || "bottom-center";
    const isTop = pos.startsWith("top");
    const y = isTop ? height - margin : margin - fontSize * 0.3;

    let x;
    if (pos.endsWith("center")) x = (width - textWidth) / 2;
    else if (pos.endsWith("right")) x = width - textWidth - margin;
    else x = margin;

    page.drawText(text, { x, y, size: fontSize, font, color: rgb(0.3, 0.3, 0.3) });
  });

  const bytes = await doc.save();
  return new Blob([bytes], { type: "application/pdf" });
}

/** Crop pages to a given margin (in points) on each side, or an explicit box. */
export async function cropPdf(file, opts = {}) {
  const doc = await loadDoc(file);
  const pages = doc.getPages();

  pages.forEach((page) => {
    const { width, height } = page.getSize();
    if (opts.box) {
      page.setCropBox(opts.box.x, opts.box.y, opts.box.width, opts.box.height);
    } else {
      const { top = 0, bottom = 0, left = 0, right = 0 } = opts.margins || {};
      page.setCropBox(left, bottom, width - left - right, height - top - bottom);
    }
  });

  const bytes = await doc.save();
  return new Blob([bytes], { type: "application/pdf" });
}

/**
 * Attempt structural repair of a damaged PDF by loading with lenient
 * parsing and re-saving, which drops unresolvable/corrupt cross-reference
 * entries and rebuilds a clean file structure. This recovers a genuine
 * class of real-world corruption (bad xref tables, truncated trailers)
 * though it cannot reconstruct data truly missing from the file.
 */
export async function repairPdf(file) {
  const bytes = file instanceof ArrayBuffer ? file : await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes, {
    ignoreEncryption: true,
    throwOnInvalidObject: false,
    updateMetadata: false,
  });
  const repaired = await doc.save({ useObjectStreams: false });
  return new Blob([repaired], { type: "application/pdf" });
}

export async function getPdfPageCount(file) {
  const doc = await loadDoc(file);
  return doc.getPageCount();
}

export { PageSizes };
