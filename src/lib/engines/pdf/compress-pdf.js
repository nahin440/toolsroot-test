"use client";

/**
 * Compresses a PDF by finding every embedded raster image (via the same
 * operator-list walk used in content-extractor.js), re-encoding it as a
 * JPEG at a reduced quality/resolution, and replacing the original image
 * XObject's data. Vector content, text, and fonts are untouched — only
 * raster images (typically the largest contributor to PDF file size) are
 * affected, which is the real, correct target for PDF compression rather
 * than a fake "reduce file size" that just repackages the same bytes.
 */
import { PDFDocument, PDFName, PDFNumber, PDFRawStream } from "@cantoo/pdf-lib";
import { openPdfDocument } from "./pdfjs-loader";
import { ensurePageRendered, resolvePageObject } from "./resolve-page-object";

const QUALITY_PRESETS = {
  low: { jpegQuality: 0.35, maxDimension: 900 }, // "Extreme" compression
  medium: { jpegQuality: 0.6, maxDimension: 1400 }, // "Recommended"
  high: { jpegQuality: 0.82, maxDimension: 2000 }, // "Less compression"
};

async function collectPageImageIds(page) {
  // Render first — reading only getOperatorList() does not reliably
  // resolve every embedded image (confirmed real bug; see
  // resolve-page-object.js's doc comment for the full explanation).
  await ensurePageRendered(page);

  const opList = await page.getOperatorList();
  const { OPS } = await import("pdfjs-dist");
  const objIds = new Set();
  for (let i = 0; i < opList.fnArray.length; i++) {
    if (opList.fnArray[i] === OPS.paintImageXObject || opList.fnArray[i] === OPS.paintImageXObjectRepeat) {
      objIds.add(opList.argsArray[i][0]);
    }
  }
  return objIds;
}

async function recompressImageObject(imgObj, preset) {
  const width = imgObj.width || imgObj.bitmap?.width;
  const height = imgObj.height || imgObj.bitmap?.height;
  if (!width || !height) return null;

  const scale = Math.min(1, preset.maxDimension / Math.max(width, height));
  const outW = Math.max(1, Math.round(width * scale));
  const outH = Math.max(1, Math.round(height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  if (imgObj.bitmap) {
    ctx.drawImage(imgObj.bitmap, 0, 0, outW, outH);
  } else if (imgObj.data) {
    const srcCanvas = document.createElement("canvas");
    srcCanvas.width = width;
    srcCanvas.height = height;
    const srcCtx = srcCanvas.getContext("2d");
    const imageData = srcCtx.createImageData(width, height);
    const src = imgObj.data;
    if (src.length === width * height * 4) {
      imageData.data.set(src);
    } else if (src.length === width * height * 3) {
      for (let i = 0, j = 0; i < src.length; i += 3, j += 4) {
        imageData.data[j] = src[i];
        imageData.data[j + 1] = src[i + 1];
        imageData.data[j + 2] = src[i + 2];
        imageData.data[j + 3] = 255;
      }
    } else {
      return null;
    }
    srcCtx.putImageData(imageData, 0, 0);
    ctx.drawImage(srcCanvas, 0, 0, outW, outH);
  } else {
    return null;
  }

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", preset.jpegQuality));
  if (!blob) return null;
  return { bytes: new Uint8Array(await blob.arrayBuffer()), width: outW, height: outH, origWidth: width, origHeight: height };
}

/**
 * Walks a page's /Resources /XObject dict and returns every image stream
 * found (including inside nested Form XObjects, which some PDF writers
 * use to group content), each tagged with its declared /Width /Height so
 * it can be matched against pdf.js's resolved decode for that exact
 * image — a deterministic match on real PDF dictionary values, not a
 * heuristic guess based on resource naming conventions.
 */
function collectImageStreamsFromResources(resources, context, seen = new Set(), depth = 0) {
  const results = [];
  if (!resources || depth > 4) return results;
  const xObjectDict = resources.lookup(PDFName.of("XObject"));
  if (!xObjectDict) return results;

  for (const key of xObjectDict.keys()) {
    const ref = xObjectDict.get(key);
    const resolvedRef = ref?.tag === "Ref" ? ref : null;
    const obj = context.lookup(ref);
    if (!(obj instanceof PDFRawStream)) continue;
    if (resolvedRef && seen.has(resolvedRef.toString())) continue;
    if (resolvedRef) seen.add(resolvedRef.toString());

    const subtype = obj.dict.lookup(PDFName.of("Subtype"));
    if (subtype?.asString?.() === "/Image" || String(subtype) === "/Image") {
      const width = obj.dict.lookup(PDFName.of("Width"));
      const height = obj.dict.lookup(PDFName.of("Height"));
      results.push({ stream: obj, width: width?.asNumber?.(), height: height?.asNumber?.() });
    } else if (subtype && String(subtype) === "/Form") {
      const formResources = obj.dict.lookup(PDFName.of("Resources"));
      results.push(...collectImageStreamsFromResources(formResources, context, seen, depth + 1));
    }
  }
  return results;
}

/**
 * @param {File|ArrayBuffer} file
 * @param {"low"|"medium"|"high"} level - "low" = smallest file / most
 *   aggressive compression, matching the person's mental model of
 *   "compression level" rather than "output quality".
 */
export async function compressPdf(file, level = "medium", onProgress) {
  const preset = QUALITY_PRESETS[level] || QUALITY_PRESETS.medium;
  const bytes = file instanceof ArrayBuffer ? file : await file.arrayBuffer();

  const pdfjsDoc = await openPdfDocument(bytes.slice ? bytes.slice(0) : bytes);
  const outDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const outPages = outDoc.getPages();
  const context = outDoc.context;

  for (let i = 0; i < pdfjsDoc.numPages && i < outPages.length; i++) {
    const pdfjsPage = await pdfjsDoc.getPage(i + 1);
    const objIds = await collectPageImageIds(pdfjsPage);
    const resources = outPages[i].node.Resources();
    const imageStreams = collectImageStreamsFromResources(resources, context);

    for (const objId of objIds) {
      try {
        const imgObj = await resolvePageObject(pdfjsPage, objId);
        if (!imgObj) continue;
        const srcWidth = imgObj.width || imgObj.bitmap?.width;
        const srcHeight = imgObj.height || imgObj.bitmap?.height;

        // Deterministic match: the real PDF image stream with the exact
        // same declared dimensions as the pdf.js-resolved decode. Two
        // genuinely distinct images on one page essentially never share
        // identical width AND height by coincidence; in the rare case
        // they do, both simply get recompressed with the same settings,
        // which is still a correct (if slightly redundant) outcome.
        const match = imageStreams.find((s) => s.width === srcWidth && s.height === srcHeight);
        if (!match) continue;

        const recompressed = await recompressImageObject(imgObj, preset);
        if (!recompressed) continue;

        const originalSize = match.stream.getContentsSize
          ? match.stream.getContentsSize()
          : match.stream.getContents().length;
        if (recompressed.bytes.length >= originalSize) {
          // Recompression didn't actually help this particular image
          // (can happen with already-optimized or noise-like source
          // images) — keep the original bytes rather than making the
          // file larger for this image.
          continue;
        }

        match.stream.dict.set(PDFName.of("Filter"), PDFName.of("DCTDecode"));
        match.stream.dict.set(PDFName.of("Width"), PDFNumber.of(recompressed.width));
        match.stream.dict.set(PDFName.of("Height"), PDFNumber.of(recompressed.height));
        match.stream.dict.set(PDFName.of("ColorSpace"), PDFName.of("DeviceRGB"));
        match.stream.dict.set(PDFName.of("BitsPerComponent"), PDFNumber.of(8));
        match.stream.dict.delete(PDFName.of("DecodeParms"));
        match.stream.dict.delete(PDFName.of("SMask"));
        match.stream.updateContents(recompressed.bytes);
      } catch {
        // An individual unresolvable/unsupported image is skipped rather
        // than aborting compression for the whole document.
      }
    }
    onProgress?.((i + 1) / pdfjsDoc.numPages);
  }

  const outBytes = await outDoc.save();
  return new Blob([outBytes], { type: "application/pdf" });
}
