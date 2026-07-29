"use client";

/**
 * Orchestrates PDF -> Word / Excel / PowerPoint conversion end to end:
 *   1. Deep-extract the content model (text runs, images, tables).
 *   2. If the PDF has no extractable text (a pure image scan), run real
 *      OCR per page first and synthesize a text-only content model from
 *      the recognized words' bounding boxes, so scanned documents still
 *      produce an editable, readable output instead of an empty file.
 *   3. Dispatch to the matching real builder.
 *
 * This is the fix for the previously reported bug: images, tables, and
 * font sizes are now part of the model from step 1 onward, not discarded
 * before reaching the output builder.
 */
import { extractDeepContentModel } from "./content-extractor";
import { buildStyledDocx } from "./build-docx";
import { buildXlsxFromContentModel } from "./build-xlsx";
import { buildPptxFromContentModel } from "./build-pptx";
import { ocrPdfToContentModel } from "../ocr/ocr-engine";

/**
 * @param {File|ArrayBuffer} file
 * @param {"docx"|"xlsx"|"pptx"} target
 * @param {(progress: {stage: string, value: number}) => void} [onProgress]
 */
export async function convertPdfToOffice(file, target, onProgress) {
  const report = (stage, value) => onProgress?.({ stage, value });

  report("Reading PDF structure", 0.05);
  let contentModel = await extractDeepContentModel(file, (p) =>
    report("Extracting text, images, and tables", 0.05 + p * 0.55)
  );

  let ocrNotice;
  if (!contentModel.hasExtractableText) {
    report("No embedded text found — running OCR", 0.62);
    contentModel = await ocrPdfToContentModel(file, (p) =>
      report("Recognizing scanned text", 0.62 + p * 0.3)
    );
    ocrNotice =
      "This document was created by OCR from a scanned PDF. Recognized text may contain occasional errors — please review before relying on it.";
  }

  report("Building output document", 0.94);
  let blob;
  if (target === "docx") {
    blob = await buildStyledDocx(contentModel, { ocrNotice });
  } else if (target === "xlsx") {
    blob = await buildXlsxFromContentModel(contentModel);
  } else if (target === "pptx") {
    blob = await buildPptxFromContentModel(contentModel);
  } else {
    throw new Error(`Unsupported conversion target: ${target}`);
  }

  report("Done", 1);
  return { blob, pageCount: contentModel.pageCount, wasOcr: Boolean(ocrNotice) };
}
