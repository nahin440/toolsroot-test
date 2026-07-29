"use client";

/**
 * Lazily loads pdf.js and points it at the self-hosted worker, cmaps, and
 * standard-font assets under /vendor/pdfjs (copied from pdfjs-dist at build
 * time — see package.json "postinstall"). Loading these from our own
 * origin, rather than a CDN, keeps every byte of a user's file on-device:
 * no request tied to file content ever leaves the browser.
 */

let pdfjsPromise = null;

export function loadPdfJs() {
  if (typeof window === "undefined") {
    throw new Error("pdf.js can only be loaded in the browser.");
  }
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist").then((mod) => {
      mod.GlobalWorkerOptions.workerSrc = "/vendor/pdfjs/pdf.worker.min.mjs";
      return mod;
    });
  }
  return pdfjsPromise;
}

/**
 * Opens a PDF (ArrayBuffer/Uint8Array/File) as a pdf.js document, wired to
 * the shared cmap/standard-font assets needed for non-Latin and symbolic
 * fonts to extract and render correctly.
 */
export async function openPdfDocument(data) {
  const pdfjsLib = await loadPdfJs();
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(await toArrayBuffer(data));
  const loadingTask = pdfjsLib.getDocument({
    data: bytes,
    cMapUrl: "/vendor/pdfjs/cmaps/",
    cMapPacked: true,
    standardFontDataUrl: "/vendor/pdfjs/standard_fonts/",
    wasmUrl: "/vendor/pdfjs/wasm/",
    iccUrl: "/vendor/pdfjs/iccs/",
    isEvalSupported: false,
  });
  return loadingTask.promise;
}

async function toArrayBuffer(data) {
  if (data instanceof ArrayBuffer) return data;
  if (data instanceof Blob) return data.arrayBuffer();
  if (data?.arrayBuffer) return data.arrayBuffer();
  throw new Error("Unsupported input type for PDF loading.");
}
