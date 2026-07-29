"use client";

import { PDFDocument, StandardFonts, rgb } from "@cantoo/pdf-lib";

function dataUrlToBytes(dataUrl) {
  const base64 = dataUrl.split(",")[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/**
 * @param {File} file
 * @param {object} opts { mode: "draw"|"type"|"upload", signatureDataUrl, typedText, signatureFile, xPt, yPt, pageNum }
 */
export async function signPdf(file, opts) {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes);
  const pages = doc.getPages();
  const targetPage = pages[(opts.pageNum || 1) - 1];
  const xPt = opts.xPt ?? 72;
  const yPt = opts.yPt ?? 72;

  if (opts.mode === "type" && opts.typedText?.trim()) {
    const font = await doc.embedFont(StandardFonts.HelveticaOblique);
    targetPage.drawText(opts.typedText, {
      x: xPt,
      y: yPt,
      size: 22,
      font,
      color: rgb(0.04, 0.04, 0.04),
    });
  } else {
    let imageBytes;
    if (opts.mode === "draw" && opts.signatureDataUrl) {
      imageBytes = dataUrlToBytes(opts.signatureDataUrl);
    } else if (opts.mode === "upload" && opts.signatureFile) {
      imageBytes = new Uint8Array(await opts.signatureFile.arrayBuffer());
    } else {
      throw new Error("Add a signature before continuing.");
    }

    const isPng = opts.mode === "draw" || /png/i.test(opts.signatureFile?.type || "");
    const embedded = isPng ? await doc.embedPng(imageBytes) : await doc.embedJpg(imageBytes);
    const width = 140;
    const height = embedded.height * (width / embedded.width);
    targetPage.drawImage(embedded, { x: xPt - width * 0.1, y: yPt - height / 2, width, height });
  }

  const outBytes = await doc.save();
  return new Blob([outBytes], { type: "application/pdf" });
}
