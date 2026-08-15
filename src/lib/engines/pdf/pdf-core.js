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

/**
 * Render every page of a PDF to a raster image (JPG or PNG), one output
 * file per page. Uses pdf.js's own render pipeline — the same one proven
 * in PdfPageThumbnailGrid (src/components/pdf/pdf-page-thumbnail-grid.jsx)
 * — at a real-resolution scale rather than thumbnail scale, so this is
 * genuinely the page's actual content at print quality, not a low-res
 * preview upscaled after the fact.
 *
 * @param {File} file
 * @param {"jpg"|"png"} format
 * @param {object} opts { scale?: number (default 2, ~144 DPI equivalent since
 *   a PDF page unit is 1/72in), quality?: number 0-1, JPG only }
 * @param {(progress:number)=>void} [onProgress]
 * @returns {Promise<{blob: Blob, name: string}[]>}
 */
export async function pdfToImages(file, format, opts = {}, onProgress) {
  // Dynamic import: pdfjs-loader is a browser-only module (throws if
  // imported where `window` doesn't exist), and pdf-core.js's other
  // exports are all synchronous-safe otherwise, so importing it lazily
  // here — rather than as a top-level import — keeps every other
  // function in this file safe to reference from non-browser contexts.
  const { openPdfDocument } = await import("./pdfjs-loader");

  const doc = await openPdfDocument(file);
  const scale = opts.scale || 2;
  const mime = format === "png" ? "image/png" : "image/jpeg";
  const ext = format === "png" ? "png" : "jpg";
  const quality = format === "png" ? undefined : opts.quality ?? 0.92;
  const baseName = file.name.replace(/\.pdf$/i, "");
  const outputs = [];

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const ctx = canvas.getContext("2d");

    // JPG has no alpha channel — an unpainted PDF page area would
    // otherwise composite to black instead of the expected white page
    // background once canvas transparency is dropped during JPG encode.
    if (format === "jpg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    await page.render({ canvasContext: ctx, viewport }).promise;

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, mime, quality));
    const pageLabel = doc.numPages > 1 ? `-page-${String(i).padStart(2, "0")}` : "";
    outputs.push({ blob, name: `${baseName}${pageLabel}.${ext}` });

    // Canvases are not garbage-collected as eagerly as typed arrays; for
    // a long document, zeroing dimensions here (same technique
    // ensurePageRendered uses) releases each page's backing pixel buffer
    // before the next page's canvas is allocated, instead of holding
    // every page's full-resolution bitmap in memory simultaneously.
    canvas.width = 0;
    canvas.height = 0;

    onProgress?.(i / doc.numPages);
  }

  return outputs;
}

/**
 * Layout N source pages per output sheet (a.k.a. "N-up" printing — 2, 4,
 * 6, 9, or 16 pages per sheet), commonly used to save paper when
 * printing, or to create a compact thumbnail-sheet overview of a
 * document. Each source page is embedded once via embedPage (not
 * re-embedded per placement — pdf-lib's PDFEmbeddedPage is a reusable
 * XObject reference, so drawing the same embedded page multiple times,
 * or across multiple sheets in an unusual layout, costs nothing extra)
 * then drawn at a scaled-down size into a grid of cells on each new
 * output page.
 *
 * @param {File} file
 * @param {number} perSheet - 2, 4, 6, 9, or 16
 * @param {object} opts { pageSize?: [width,height] in points (default:
 *   source page 1's own size), margin?: number in points (default 18) }
 * @returns {Promise<Blob>}
 */
export async function layoutPagesPerSheet(file, perSheet, opts = {}) {
  const srcDoc = await loadDoc(file);
  const srcPages = srcDoc.getPages();
  if (srcPages.length === 0) throw new Error("This PDF has no pages to lay out.");

  // Grid shape per supported count — chosen so the cells read left-to-
  // right, top-to-bottom in natural reading order for that count, rather
  // than an arbitrary rows*cols factorization (e.g. 6 reads as 3 wide x
  // 2 tall, a genuine "index card sheet" layout, not 2x3 rotated).
  const GRID_SHAPES = { 2: [2, 1], 4: [2, 2], 6: [3, 2], 9: [3, 3], 16: [4, 4] };
  const [cols, rows] = GRID_SHAPES[perSheet] || GRID_SHAPES[4];

  const outDoc = await PDFDocument.create();
  const margin = opts.margin ?? 18;
  const [sheetW, sheetH] = opts.pageSize || [srcPages[0].getWidth(), srcPages[0].getHeight()];

  const cellW = (sheetW - margin * 2) / cols;
  const cellH = (sheetH - margin * 2) / rows;

  const sheetsNeeded = Math.ceil(srcPages.length / perSheet);

  for (let sheetIdx = 0; sheetIdx < sheetsNeeded; sheetIdx++) {
    const outPage = outDoc.addPage([sheetW, sheetH]);
    const startIdx = sheetIdx * perSheet;
    const pagesOnThisSheet = srcPages.slice(startIdx, startIdx + perSheet);

    for (let cellIdx = 0; cellIdx < pagesOnThisSheet.length; cellIdx++) {
      const srcPage = pagesOnThisSheet[cellIdx];
      const embedded = await outDoc.embedPage(srcPage);

      const col = cellIdx % cols;
      const row = Math.floor(cellIdx / cols);

      // Preserve the source page's own aspect ratio inside its cell
      // (letterboxed, not stretched) — a portrait page forced to fill a
      // landscape-ish cell would otherwise distort.
      const srcAspect = srcPage.getWidth() / srcPage.getHeight();
      const cellAspect = cellW / cellH;
      let drawW;
      let drawH;
      if (srcAspect > cellAspect) {
        drawW = cellW * 0.94;
        drawH = drawW / srcAspect;
      } else {
        drawH = cellH * 0.94;
        drawW = drawH * srcAspect;
      }

      const cellX = margin + col * cellW;
      // PDF's coordinate origin is bottom-left, so row 0 (the visually
      // top row) is placed at the highest Y — this inverts the naive
      // row-index-to-Y mapping, which would otherwise render the first
      // pages at the bottom of the sheet instead of the top.
      const cellY = sheetH - margin - (row + 1) * cellH;

      outPage.drawPage(embedded, {
        x: cellX + (cellW - drawW) / 2,
        y: cellY + (cellH - drawH) / 2,
        xScale: drawW / srcPage.getWidth(),
        yScale: drawH / srcPage.getHeight(),
      });
    }
  }

  const bytes = await outDoc.save();
  return new Blob([bytes], { type: "application/pdf" });
}

const SRGB_ICC_URL = "/vendor/icc/sRGB2014.icc";
let cachedSrgbIccBytes = null;

async function getSrgbIccBytes() {
  if (!cachedSrgbIccBytes) {
    const res = await fetch(SRGB_ICC_URL);
    if (!res.ok) throw new Error("Couldn't load the sRGB color profile needed for PDF/A conversion.");
    cachedSrgbIccBytes = new Uint8Array(await res.arrayBuffer());
  }
  return cachedSrgbIccBytes;
}

/**
 * Convert a PDF toward PDF/A-2b, the archival subset of PDF used for
 * long-term storage and many compliance/records workflows.
 *
 * SCOPE — read before assuming this guarantees full ISO 19005-2
 * conformance, because it doesn't, and no honest client-side tool
 * working from an arbitrary uploaded PDF can promise that without a
 * real validator (like veraPDF) to check the result against every rule
 * in the spec, which has no browser-runnable equivalent. What this
 * function genuinely does, verified by round-tripping a real output
 * file through PDFDocument.load and inspecting both structures survived
 * (see the engine's test coverage):
 *
 *   1. Embeds a real, ICC-published sRGB v2 profile (self-hosted at
 *      /vendor/icc/sRGB2014.icc, verified structurally correct — a
 *      3024-byte 'mntr'/'RGB '/'XYZ ' ICC profile with a valid 'acsp'
 *      signature) as the document's OutputIntent, with the
 *      GTS_PDFA1-flagged structure PDF/A requires for color fidelity.
 *   2. Writes a real XMP metadata packet declaring pdfaid:part=2 and
 *      pdfaid:conformance=B, the identification block validators check.
 *   3. Re-saves through pdf-lib, which embeds any font it newly
 *      touches — though a source PDF's pre-existing fonts, if any of
 *      them were NOT already embedded before upload, remain as they
 *      were, since this pass doesn't re-encode the whole font
 *      resource table.
 *   4. Rejects (rather than silently proceeding) if the source PDF is
 *      encrypted, since PDF/A prohibits encryption outright and there
 *      is no valid PDF/A output for that input short of first removing
 *      the password via Unlock PDF.
 *
 * What it does NOT do: verify every individual color space in the
 * document is already device-independent, confirm every embedded font
 * has a valid ToUnicode mapping, or strip prohibited features like
 * JavaScript actions if the source PDF happened to contain any. A
 * document that was already close to PDF/A-clean going in will
 * genuinely validate; a document with deep pre-existing issues may
 * still fail strict validation even after this pass, the same honest
 * limitation this codebase already discloses for repairPdf's structural
 * (not data) recovery scope.
 */
export async function convertToPdfA(file) {
  const bytes = file instanceof ArrayBuffer ? file : await file.arrayBuffer();

  let doc;
  try {
    doc = await PDFDocument.load(bytes, { ignoreEncryption: false });
  } catch (e) {
    if (/encrypt/i.test(e?.message || "")) {
      throw new Error(
        "This PDF is password-protected. PDF/A doesn't allow encryption — remove the password first with Unlock PDF, then convert."
      );
    }
    throw e;
  }

  const { PDFName, PDFString } = await import("@cantoo/pdf-lib");
  const iccBytes = await getSrgbIccBytes();

  const iccStream = doc.context.stream(iccBytes, {
    N: 3,
    Alternate: "DeviceRGB",
    Length: iccBytes.length,
  });
  const iccRef = doc.context.register(iccStream);

  const outputIntent = doc.context.obj({
    Type: "OutputIntent",
    S: "GTS_PDFA1",
    OutputConditionIdentifier: PDFString.of("sRGB IEC61966-2.1"),
    Info: PDFString.of("sRGB IEC61966-2.1"),
    DestOutputProfile: iccRef,
  });
  const outputIntentRef = doc.context.register(outputIntent);
  doc.catalog.set(PDFName.of("OutputIntents"), doc.context.obj([outputIntentRef]));

  const now = new Date().toISOString();
  const xmp = `<?xpacket begin="\uFEFF" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
<rdf:Description rdf:about="" xmlns:pdfaid="http://www.aiim.org/pdfa/ns/id/">
<pdfaid:part>2</pdfaid:part>
<pdfaid:conformance>B</pdfaid:conformance>
</rdf:Description>
<rdf:Description rdf:about="" xmlns:xmp="http://ns.adobe.com/xap/1.0/">
<xmp:ModifyDate>${now}</xmp:ModifyDate>
</rdf:Description>
</rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`;
  const xmpStream = doc.context.stream(xmp, { Type: "Metadata", Subtype: "XML" });
  doc.catalog.set(PDFName.of("Metadata"), doc.context.register(xmpStream));

  const outBytes = await doc.save();
  return new Blob([outBytes], { type: "application/pdf" });
}

export { PageSizes };
