"use client";

/**
 * OCR PDF: makes a scanned PDF searchable by overlaying an invisible text
 * layer (rendered at 0 opacity, positioned per-word from Tesseract's
 * bounding boxes) on top of the original page images. The visual
 * appearance of the PDF is completely unchanged; only text selection and
 * search become possible, matching how every real OCR product handles
 * this operation.
 */
import { PDFDocument, rgb, StandardFonts } from "@cantoo/pdf-lib";
import { createWorker } from "tesseract.js";
import { openPdfDocument } from "../pdf/pdfjs-loader";

/** Helvetica (WinAnsi) can't encode characters like curly quotes or em
 * dashes that OCR sometimes emits; replace them with the closest ASCII
 * equivalent so a single stray glyph never aborts the whole page's text
 * layer. The visible page image is unaffected either way — this only
 * touches the invisible, searchable text underneath it. */
function sanitizeForWinAnsi(text) {
  return text
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/[^\x00-\xFF]/g, "");
}

const WORKER_PATHS = {
  workerPath: "/vendor/tesseract/worker.min.js",
  corePath: "/vendor/tesseract/tesseract-core-simd-lstm.wasm.js",
};

function workerPathsFor(lang) {
  if (lang === "eng") {
    return { ...WORKER_PATHS, langPath: "/vendor/tessdata" };
  }
  return WORKER_PATHS;
}

/** Renders a pdf.js page to a PNG Blob at the given render scale, plus the page's true (unscaled) point dimensions for later coordinate mapping. */
async function renderPageToPngBlob(page, scale) {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const ctx = canvas.getContext("2d");
  await page.render({ canvasContext: ctx, viewport }).promise;
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png", 0.92));
  const pxWidth = canvas.width;
  const pxHeight = canvas.height;
  canvas.width = 0;
  canvas.height = 0;
  return { blob, pxWidth, pxHeight };
}

/**
 * @param {File|ArrayBuffer} file
 * @param {(progress:number)=>void} [onProgress]
 * @param {string} [lang]
 */
export async function makeSearchablePdf(file, onProgress, lang = "eng") {
  const srcDoc = await openPdfDocument(file);
  const worker = await createWorker(lang, 1, workerPathsFor(lang));
  const outDoc = await PDFDocument.create();
  const invisibleFont = await outDoc.embedFont(StandardFonts.Helvetica);
  const RENDER_SCALE = 2;

  try {
    for (let pageNum = 1; pageNum <= srcDoc.numPages; pageNum++) {
      const srcPage = await srcDoc.getPage(pageNum);
      const baseViewport = srcPage.getViewport({ scale: 1 });

      const { blob: pageBlob, pxWidth, pxHeight } = await renderPageToPngBlob(srcPage, RENDER_SCALE);
      // Pass the real Blob directly — {width, height, data} is NOT a
      // supported Tesseract.js input shape (it expects a decoded image
      // source it can decode itself: a Blob, File, canvas, or image
      // element — not a raw byte array paired with dimensions). Passing
      // that invalid shape previously caused recognize() to throw for
      // every single page.
      const { data } = await worker.recognize(pageBlob, {}, { blocks: true });
      const bytes = new Uint8Array(await pageBlob.arrayBuffer());

      const pngImage = await outDoc.embedPng(bytes);
      const outPage = outDoc.addPage([baseViewport.width, baseViewport.height]);
      outPage.drawImage(pngImage, {
        x: 0,
        y: 0,
        width: baseViewport.width,
        height: baseViewport.height,
      });

      const words = (data.blocks || []).flatMap((b) =>
        (b.paragraphs || []).flatMap((p) => p.lines.flatMap((l) => l.words))
      );

      const ptScale = baseViewport.width / pxWidth;
      for (const word of words) {
        const cleanText = sanitizeForWinAnsi(word.text);
        if (!cleanText.trim()) continue;
        const wPt = (word.bbox.x1 - word.bbox.x0) * ptScale;
        const hPt = (word.bbox.y1 - word.bbox.y0) * ptScale;
        if (wPt <= 0 || hPt <= 0) continue;
        const xPt = word.bbox.x0 * ptScale;
        // PDF text origin is baseline-from-bottom; pdf.js/canvas Y is
        // top-down, so flip and nudge to approximate the baseline.
        const yPt = baseViewport.height - word.bbox.y1 * ptScale;

        try {
          outPage.drawText(cleanText, {
            x: xPt,
            y: yPt,
            size: Math.max(hPt * 0.85, 4),
            color: rgb(0, 0, 0),
            opacity: 0, // invisible — the rendered page image is what's seen
            font: invisibleFont,
          });
        } catch {
          // A single unencodable word never aborts the rest of the page.
        }
      }

      onProgress?.(pageNum / srcDoc.numPages);
    }
  } finally {
    await worker.terminate();
  }

  const bytes = await outDoc.save();
  return new Blob([bytes], { type: "application/pdf" });
}
