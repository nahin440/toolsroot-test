"use client";

import { readDocxContentModel } from "../docx/read-docx";
import { buildPdfFromDocxModel } from "../docx/build-pdf-from-docx";
import { readPptxContentModel } from "./read-pptx";
import { buildPdfFromPptxModel } from "./build-pdf-from-pptx";
import { extractDeepContentModel } from "../pdf/content-extractor";
import { buildPptxFromContentModel } from "../pdf/build-pptx";
import { ocrPdfToContentModel } from "../ocr/ocr-engine";

/** Word (.docx) -> PDF, preserving real font size/bold/italic/color, images, and tables. */
export async function wordToPdf(file, onProgress) {
  onProgress?.(0.1);
  const model = await readDocxContentModel(file);
  onProgress?.(0.4);
  const blob = await buildPdfFromDocxModel(model);
  onProgress?.(1);
  return blob;
}

/** PowerPoint (.pptx) -> PDF, one page per slide, shapes placed at their real position. */
export async function powerpointToPdf(file, onProgress) {
  onProgress?.(0.1);
  const model = await readPptxContentModel(file);
  onProgress?.(0.35);
  const blob = await buildPdfFromPptxModel(model, (p) => onProgress?.(0.35 + p * 0.65));
  return blob;
}

/** PDF -> PowerPoint, reusing the same deep content model as PDF -> Word. */
export async function pdfToPowerpoint(file, onProgress) {
  let contentModel = await extractDeepContentModel(file, (p) => onProgress?.(p * 0.5));
  if (!contentModel.hasExtractableText) {
    contentModel = await ocrPdfToContentModel(file, (p) => onProgress?.(0.5 + p * 0.3));
  }
  const blob = await buildPptxFromContentModel(contentModel);
  onProgress?.(1);
  return blob;
}
