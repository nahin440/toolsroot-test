"use client";

import { PDFDocument, PageSizes } from "@cantoo/pdf-lib";
import { loadImageBitmapFromFile, drawToCanvas } from "./image-core";

const PAGE_SIZES_PT = {
  a4: [595.28, 841.89],
  letter: [612, 792],
  fit: null, // page sized to match each image's own aspect ratio
};

/**
 * @param {File[]} files
 * @param {object} opts { pageSize: "a4"|"letter"|"fit", orientation: "portrait"|"landscape", marginPt }
 */
export async function imagesToPdf(files, opts = {}) {
  const doc = await PDFDocument.create();
  const margin = opts.marginPt ?? 24;

  for (const file of files) {
    const bitmap = await loadImageBitmapFromFile(file);

    // Re-encode through canvas to a PNG so every source format (including
    // ones pdf-lib can't embed directly, like HEIC, WEBP, or SVG) becomes
    // embeddable — pdf-lib's embedPng/embedJpg only accept those two.
    const canvas = drawToCanvas(bitmap, bitmap.width, bitmap.height);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    const pngBytes = new Uint8Array(await blob.arrayBuffer());
    const embedded = await doc.embedPng(pngBytes);

    let [pageW, pageH] = PAGE_SIZES_PT[opts.pageSize || "a4"] || PAGE_SIZES_PT.a4;
    if (opts.pageSize === "fit") {
      pageW = bitmap.width * (72 / 96) + margin * 2;
      pageH = bitmap.height * (72 / 96) + margin * 2;
    } else if (opts.orientation === "landscape") {
      [pageW, pageH] = [pageH, pageW];
    }

    const page = doc.addPage([pageW, pageH]);
    const availW = pageW - margin * 2;
    const availH = pageH - margin * 2;
    const imgRatio = bitmap.width / bitmap.height;
    const availRatio = availW / availH;

    let drawW;
    let drawH;
    if (imgRatio > availRatio) {
      drawW = availW;
      drawH = availW / imgRatio;
    } else {
      drawH = availH;
      drawW = availH * imgRatio;
    }

    page.drawImage(embedded, {
      x: (pageW - drawW) / 2,
      y: (pageH - drawH) / 2,
      width: drawW,
      height: drawH,
    });
  }

  const bytes = await doc.save();
  return new Blob([bytes], { type: "application/pdf" });
}
