"use client";

/**
 * Real OCR engine backed by Tesseract.js, pointed at the self-hosted
 * worker/core assets under /vendor/tesseract (see public/vendor/tesseract)
 * so recognition never depends on an external CDN's uptime. English
 * trained-data is also self-hosted under /vendor/tessdata (the
 * overwhelming majority of usage); other languages fall back to
 * Tesseract's own CDN, fetched once and cached by the browser
 * afterward — bundling every language's data (many are 10MB+ each)
 * would bloat the deploy for no benefit to users who only ever need
 * one or two languages.
 */
import { createWorker } from "tesseract.js";
import { openPdfDocument } from "../pdf/pdfjs-loader";

const WORKER_PATHS = {
  workerPath: "/vendor/tesseract/worker.min.js",
  corePath: "/vendor/tesseract/tesseract-core-simd-lstm.wasm.js",
};

function workerPathsFor(lang) {
  // Only English is self-hosted today; add more languages under
  // /vendor/tessdata and list them here as they're added.
  if (lang === "eng") {
    return { ...WORKER_PATHS, langPath: "/vendor/tessdata" };
  }
  return WORKER_PATHS;
}

let workerPromise = null;

/** Shared, lazily-created Tesseract worker (recreated if the language changes). */
async function getWorker(lang = "eng") {
  if (!workerPromise || workerPromise.lang !== lang) {
    if (workerPromise) {
      const prev = await workerPromise;
      await prev.terminate();
    }
    const p = createWorker(lang, 1, workerPathsFor(lang));
    p.lang = lang;
    workerPromise = p;
  }
  return workerPromise;
}

export async function terminateOcrWorker() {
  if (workerPromise) {
    const w = await workerPromise;
    await w.terminate();
    workerPromise = null;
  }
}

/** Render one pdf.js page to an offscreen canvas at a given DPI scale. */
async function renderPageToCanvas(page, scale) {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const ctx = canvas.getContext("2d");
  await page.render({ canvasContext: ctx, viewport }).promise;
  return { canvas, viewport };
}

/**
 * Groups Tesseract's paragraph/line hierarchy into content-model blocks,
 * using the real paragraph boundaries Tesseract already detected rather
 * than re-deriving them from a flat word list.
 */
function ocrPageToBlocks(tesseractPage, pxToPt) {
  const blocks = [];
  const paragraphs = (tesseractPage.blocks || []).flatMap((b) => b.paragraphs || []);

  for (const para of paragraphs) {
    const text = para.lines.map((l) => l.text.trim()).join(" ").trim();
    if (!text) continue;

    const avgLineHeightPx =
      para.lines.reduce((s, l) => s + (l.bbox.y1 - l.bbox.y0), 0) / para.lines.length;
    const fontSizePt = Math.max(avgLineHeightPx * pxToPt * 0.72, 8);

    blocks.push({
      type: "paragraph",
      runs: [
        {
          text,
          fontFamily: "Calibri",
          fontSize: fontSizePt,
          bold: false,
          italic: false,
        },
      ],
    });
  }

  return blocks;
}

/**
 * OCRs every page of a PDF and returns a content model shaped exactly
 * like extractDeepContentModel's output, so downstream builders (DOCX,
 * XLSX, PPTX) don't need OCR-specific branching.
 *
 * @param {File|ArrayBuffer} file
 * @param {(progress:number)=>void} [onProgress]
 * @param {string} [lang] Tesseract language code, default English.
 */
export async function ocrPdfToContentModel(file, onProgress, lang = "eng") {
  const doc = await openPdfDocument(file);
  const worker = await getWorker(lang);
  const pages = [];
  const RENDER_SCALE = 2; // ~144dpi, a good accuracy/speed balance for OCR

  for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
    const page = await doc.getPage(pageNum);
    const baseViewport = page.getViewport({ scale: 1 });
    const { canvas } = await renderPageToCanvas(page, RENDER_SCALE);

    const { data } = await worker.recognize(canvas, {}, { blocks: true });
    const pxToPt = 1 / RENDER_SCALE;
    const blocks = ocrPageToBlocks(data, pxToPt);

    pages.push({
      pageNum,
      widthPt: baseViewport.width,
      heightPt: baseViewport.height,
      blocks: blocks.length
        ? blocks
        : [{ type: "paragraph", runs: [{ text: "", fontFamily: "Calibri", fontSize: 11 }] }],
    });

    canvas.width = 0;
    canvas.height = 0; // release memory promptly between pages
    onProgress?.(pageNum / doc.numPages);
  }

  return { pages, pageCount: doc.numPages, hasExtractableText: true, wasOcr: true };
}

/**
 * OCRs a single standalone image (not a PDF page) and returns plain
 * recognized text plus per-word confidence, for the standalone OCR-image
 * use case (e.g. "OCR this photo of a document").
 */
export async function ocrImage(imageFileOrCanvas, onLoggerUpdate, lang = "eng") {
  const worker = await getWorker(lang);
  if (onLoggerUpdate) {
    worker.setParameters?.({});
  }
  const { data } = await worker.recognize(imageFileOrCanvas, {}, { blocks: true });
  return data;
}
