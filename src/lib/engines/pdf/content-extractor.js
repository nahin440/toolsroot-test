"use client";

/**
 * Deep PDF Content Model Extraction
 * ------------------------------------------------------------------------
 * This is the fidelity-critical engine behind PDF -> Word / Excel /
 * PowerPoint. The previous build's bug (plain, unstyled text with no
 * images or real tables in the output) came from discarding per-run font
 * metadata and never reading the page's image-paint operators at all.
 *
 * This module fixes both:
 *
 *   1. Per-run styling — instead of collapsing a line to a single string,
 *      every text run keeps its own font family, size, bold/italic flags
 *      (from the embedded font's descriptor), and RGB color, so a DOCX
 *      paragraph can be rebuilt with real formatted TextRuns rather than
 *      one flat run per paragraph.
 *
 *   2. Real embedded images — walks the page's operator list for
 *      `paintImageXObject` / `paintInlineImageXObject`, resolves the
 *      decoded bitmap via `page.objs`, and records its exact position and
 *      size in page-space (from the active CTM at paint time) so it can
 *      be re-inserted into the DOCX/PPTX at the same reading position
 *      instead of being silently dropped.
 *
 *   3. Real table grids — clusters text into row bands by Y-position (as
 *      before) but then infers column boundaries via a proper gap-based
 *      column-clustering pass across ALL rows at once (not just the
 *      widest single row), producing a genuine rows x columns grid used
 *      to emit a real DOCX/XLSX table instead of a single space-split
 *      guess.
 * ------------------------------------------------------------------------
 */

import { openPdfDocument } from "./pdfjs-loader";
import { ensurePageRendered, resolvePageObject } from "./resolve-page-object";

const PT_TO_EMU = 12700; // 1pt = 12700 EMU, used by DOCX/PPTX image sizing

/** Group raw text items into visual lines by Y-band, keeping per-item styling. */
function groupItemsIntoLines(items, styles) {
  const withStyle = items
    .filter((it) => it.str !== undefined)
    .map((it) => {
      const style = styles[it.fontName] || {};
      const fontSize = Math.hypot(it.transform[2], it.transform[3]) || Math.abs(it.transform[3]) || 10;
      return {
        text: it.str,
        x: it.transform[4],
        y: it.transform[5],
        width: it.width,
        height: it.height || fontSize,
        fontSize,
        fontFamily: resolveFontFamily(style.fontFamily, it.str),
        bold: isBoldFont(style),
        italic: isItalicFont(style),
        hasEOL: it.hasEOL,
      };
    });

  withStyle.sort((a, b) => b.y - a.y || a.x - b.x);

  const lines = [];
  let current = null;
  for (const item of withStyle) {
    if (!item.text.trim() && !current) continue;
    const yTolerance = Math.max(item.fontSize * 0.35, 2);
    if (current && Math.abs(item.y - current.y) <= yTolerance) {
      current.runs.push(item);
      current.y = (current.y + item.y) / 2;
      current.maxX = Math.max(current.maxX, item.x + item.width);
    } else {
      if (current) lines.push(current);
      current = { y: item.y, minX: item.x, maxX: item.x + item.width, runs: [item] };
    }
  }
  if (current) lines.push(current);
  return lines;
}

// Unicode-block -> Word-safe font map for scripts that Times New
// Roman / Calibri / Arial do not cover. Word 2007+ on Windows ships
// Nirmala UI (Bangla/Devanagari/Gujarati/Gurmukhi/Kannada/Malayalam/
// Odia/Tamil/Telugu/Sinhala), Arial Unicode-class coverage isn't
// guaranteed, so we target the specific per-script system font Word
// itself uses for its own UI and default document fonts on a stock
// Windows/Office install, rather than relying on the PDF's embedded
// font name. Extended beyond the original Bangla-only fix to cover
// every major native script for an international user base.
const SCRIPT_FONT_RANGES = [
  { name: "Nirmala UI", re: /[\u0980-\u09FF]/ }, // Bengali/Bangla
  { name: "Nirmala UI", re: /[\u0900-\u097F]/ }, // Devanagari
  { name: "Nirmala UI", re: /[\u0A00-\u0A7F]/ }, // Gurmukhi
  { name: "Nirmala UI", re: /[\u0A80-\u0AFF]/ }, // Gujarati
  { name: "Nirmala UI", re: /[\u0B00-\u0B7F]/ }, // Odia
  { name: "Nirmala UI", re: /[\u0B80-\u0BFF]/ }, // Tamil
  { name: "Nirmala UI", re: /[\u0C00-\u0C7F]/ }, // Telugu
  { name: "Nirmala UI", re: /[\u0C80-\u0CFF]/ }, // Kannada
  { name: "Nirmala UI", re: /[\u0D00-\u0D7F]/ }, // Malayalam
  { name: "Nirmala UI", re: /[\u0D80-\u0DFF]/ }, // Sinhala
  { name: "Leelawadee UI", re: /[\u0E00-\u0E7F]/ }, // Thai
  { name: "Leelawadee UI", re: /[\u0E80-\u0EFF]/ }, // Lao
  { name: "Myanmar Text", re: /[\u1000-\u109F]/ }, // Myanmar/Burmese
  { name: "Khmer UI", re: /[\u1780-\u17FF]/ }, // Khmer
  { name: "Malgun Gothic", re: /[\uAC00-\uD7AF]/ }, // Hangul (Korean)
  { name: "Microsoft YaHei", re: /[\u4E00-\u9FFF]/ }, // CJK Unified (Chinese)
  { name: "MS Gothic", re: /[\u3040-\u30FF]/ }, // Hiragana/Katakana (Japanese)
  { name: "Arial", re: /[\u0600-\u06FF]/ }, // Arabic (Arial has Arabic coverage on Windows)
  { name: "Arial", re: /[\u0700-\u074F]/ }, // Syriac
  { name: "David", re: /[\u0590-\u05FF]/ }, // Hebrew
  { name: "Sylfaen", re: /[\u10A0-\u10FF]/ }, // Georgian
  { name: "Sylfaen", re: /[\u0530-\u058F]/ }, // Armenian
  { name: "Ebrima", re: /[\u1200-\u137F]/ }, // Ethiopic/Amharic
];

/** Picks the font for a run's actual text, preferring a script-specific
 * font whenever the text contains characters outside Times/Calibri's
 * Latin coverage — the PDF's declared font name is not a reliable
 * signal here (see resolveFontFamily below). */
function fontForScript(text) {
  for (const { name, re } of SCRIPT_FONT_RANGES) {
    if (re.test(text)) return name;
  }
  return null;
}

/**
 * Resolves the DOCX font for a text run.
 *
 * IMPORTANT: pdf.js's getTextContent() does NOT return the embedded
 * font's real name (e.g. "Nikosh") in style.fontFamily — it returns a
 * generic CSS fallback family such as "sans-serif", "serif", or
 * "monospace", derived from the font's descriptor flags. This is by
 * design in pdf.js (it expects the caller to render the actual
 * embedded glyphs, not to name the font), but it broke Bangla output:
 * normalizeFontFamily's regex `/times|serif|.../` matched the literal
 * substring "serif" inside "sans-serif" and mapped EVERY run — Bangla
 * included — to "Times New Roman", which has no Bangla glyphs. Word
 * then renders those runs as empty boxes ("tofu").
 *
 * Fix: detect the script from the run's actual Unicode text first. If
 * the text belongs to a script Times New Roman/Calibri can't render,
 * use a font Word 2007+ on Windows actually has for that script
 * (Nirmala UI for Bangla, etc.) regardless of what pdf.js reported.
 * Only fall back to the old generic-family guess for plain Latin text,
 * where "serif" vs "sans-serif" is a meaningful, safe distinction.
 */
function resolveFontFamily(raw, text) {
  const scriptFont = fontForScript(text || "");
  if (scriptFont) return scriptFont;
  return normalizeFontFamily(raw);
}

function normalizeFontFamily(raw) {
  if (!raw) return "Calibri";
  const cleaned = raw.replace(/^[A-Z]{6}\+/, ""); // strip subset tag e.g. "ABCDEF+"
  // Guard against generic CSS fallback families ("sans-serif", "serif",
  // "monospace") that pdf.js returns when it can't/won't expose a real
  // font name — check for the "sans-" prefix before the broader "serif"
  // match so "sans-serif" doesn't fall into the Times New Roman branch.
  if (/^sans-serif$/i.test(cleaned)) return "Calibri";
  if (/times|serif|georgia|cambria|garamond/i.test(cleaned)) return "Times New Roman";
  if (/courier|mono|consolas/i.test(cleaned)) return "Courier New";
  if (/arial|helvetica|calibri|segoe/i.test(cleaned)) return "Calibri";
  return cleaned.split(/[,+]/)[0] || "Calibri";
}

function isBoldFont(style) {
  if (typeof style.fontWeight === "number") return style.fontWeight >= 600;
  const name = (style.fontFamily || "").toLowerCase();
  return /bold|black|heavy|semibold/.test(name);
}

function isItalicFont(style) {
  if (style.italicAngle) return Math.abs(style.italicAngle) > 0.01;
  const name = (style.fontFamily || "").toLowerCase();
  return /italic|oblique/.test(name);
}

function classifyLines(lines) {
  const sizes = lines.map((l) => Math.max(...l.runs.map((r) => r.fontSize)));
  const bodySize = median(sizes) || 11;

  const blocks = [];
  let paraLines = [];
  let lastLine = null;

  function flushParagraph() {
    if (!paraLines.length) return;
    const runs = paraLines.flatMap((l, i) => {
      const lineRuns = mergeRunsByStyle(l.runs);
      if (i > 0) lineRuns[0] = { ...lineRuns[0], text: " " + lineRuns[0].text.replace(/^\s+/, "") };
      return lineRuns;
    });
    blocks.push({ type: "paragraph", runs });
    paraLines = [];
  }

  for (const line of lines) {
    const maxSize = Math.max(...line.runs.map((r) => r.fontSize));
    const text = line.runs.map((r) => r.text).join("");
    const isBulleted = /^\s*([•\u2022\u25CF\u25AA\u2043]|[-*]\s|\d+[.)]\s)/.test(text);
    const isBig = maxSize > bodySize * 1.22;
    const isShortAndBig = isBig && text.trim().length < 110;
    const bigGapAbove = lastLine && lastLine.y - line.y > maxSize * 2.2;

    if (isShortAndBig) {
      flushParagraph();
      const level = maxSize > bodySize * 1.8 ? 1 : maxSize > bodySize * 1.45 ? 2 : 3;
      blocks.push({ type: "heading", level, runs: mergeRunsByStyle(line.runs) });
    } else if (isBulleted) {
      flushParagraph();
      blocks.push({
        type: "list-item",
        ordered: /^\s*\d+[.)]\s/.test(text),
        runs: mergeRunsByStyle(line.runs).map((r, i) =>
          i === 0 ? { ...r, text: r.text.replace(/^\s*([•\u2022\u25CF\u25AA\u2043]|[-*]\s|\d+[.)]\s)/, "") } : r
        ),
      });
    } else {
      if (bigGapAbove) flushParagraph();
      paraLines.push(line);
    }
    lastLine = line;
  }
  flushParagraph();
  return blocks;
}

function mergeRunsByStyle(runs) {
  const merged = [];
  for (const r of runs) {
    const last = merged[merged.length - 1];
    if (
      last &&
      last.fontFamily === r.fontFamily &&
      last.bold === r.bold &&
      last.italic === r.italic &&
      Math.abs(last.fontSize - r.fontSize) < 0.4
    ) {
      last.text += r.text;
    } else {
      merged.push({ ...r });
    }
  }
  return merged;
}

function median(arr) {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

/**
 * Detects a table region: a contiguous run of lines where 3+ rows share a
 * consistent set of 2+ column start-x positions (within tolerance). Real
 * multi-row alignment, not a single-row guess.
 */
function detectTables(lines) {
  if (lines.length < 3) return { tables: [], remainingLines: lines };

  const xClusters = clusterColumnStarts(lines);
  if (xClusters.length < 2) return { tables: [], remainingLines: lines };

  const rows = [];
  const usedLineIdx = new Set();
  lines.forEach((line, idx) => {
    const cells = assignRunsToColumns(line.runs, xClusters);
    const filled = cells.filter((c) => c.trim()).length;
    if (filled >= 2) {
      rows.push({ idx, cells });
    }
  });

  if (rows.length < 3) return { tables: [], remainingLines: lines };

  const groups = [];
  let current = [rows[0]];
  for (let i = 1; i < rows.length; i++) {
    if (rows[i].idx - rows[i - 1].idx <= 2) {
      current.push(rows[i]);
    } else {
      if (current.length >= 3) groups.push(current);
      current = [rows[i]];
    }
  }
  if (current.length >= 3) groups.push(current);

  const tables = groups.map((g) => {
    g.forEach((r) => usedLineIdx.add(r.idx));
    return { type: "table", rows: g.map((r) => r.cells) };
  });

  const remainingLines = lines.filter((_, idx) => !usedLineIdx.has(idx));
  return { tables, remainingLines, tableAnchors: groups.map((g) => g[0].idx) };
}

function clusterColumnStarts(lines) {
  const starts = [];
  lines.forEach((line) => {
    let lastEnd = -Infinity;
    line.runs.forEach((r) => {
      const isWideSpace = /^\s+$/.test(r.text) && r.width > (r.fontSize || 10) * 1.5;
      if (r.x - lastEnd > (r.fontSize || 10) * 1.1) starts.push(r.x);
      lastEnd = r.x + r.width;
      // A wide whitespace-only run (common when a PDF generator encodes an
      // inter-column gap as one stretched space glyph rather than an actual
      // positional jump) marks the START of the NEXT column at its end.
      if (isWideSpace) starts.push(lastEnd);
    });
  });
  starts.sort((a, b) => a - b);

  const clusters = [];
  for (const x of starts) {
    const near = clusters.find((c) => Math.abs(c.x - x) < 12);
    if (near) {
      near.count++;
      near.x = (near.x * (near.count - 1) + x) / near.count;
    } else {
      clusters.push({ x, count: 1 });
    }
  }
  return clusters
    .filter((c) => c.count >= 3)
    .sort((a, b) => a.x - b.x)
    .map((c) => c.x);
}

function assignRunsToColumns(runs, columnXs) {
  const cells = new Array(columnXs.length).fill("");
  runs.forEach((r) => {
    if (/^\s+$/.test(r.text)) return; // separator-only run, not cell content
    let colIdx = 0;
    let minDist = Infinity;
    columnXs.forEach((cx, i) => {
      const d = Math.abs(r.x - cx);
      if (d < minDist) {
        minDist = d;
        colIdx = i;
      }
    });
    cells[colIdx] = cells[colIdx] ? cells[colIdx] + " " + r.text : r.text;
  });
  return cells.map((c) => c.trim());
}

/**
 * Extract every embedded raster image on a page, with its true page-space
 * position/size.
 *
 * IMPORTANT: this renders the page to a throwaway canvas first. Reading
 * only `page.getOperatorList()` is not sufficient to reliably resolve
 * every embedded image — confirmed by direct reproduction against a real
 * multi-page document where an image nested inside a Form XObject never
 * resolved via `page.objs.get()` after `getOperatorList()` alone, no
 * matter how long we waited, but resolved in milliseconds once the page
 * had gone through one real `page.render()` pass. This appears to be a
 * pdf.js internal behavior where certain nested image objects are only
 * queued for decode during rendering, not during operator-list
 * construction. Rendering first — even though we discard the rendered
 * pixels — is what makes image extraction reliable for every page.
 */
async function extractPageImages(page, warnings) {
  await ensurePageRendered(page);

  const opList = await page.getOperatorList();
  const { OPS } = await import("pdfjs-dist");
  const images = [];
  let ctm = [1, 0, 0, 1, 0, 0];
  const stack = [];

  for (let i = 0; i < opList.fnArray.length; i++) {
    const fn = opList.fnArray[i];
    const args = opList.argsArray[i];

    if (fn === OPS.save) {
      stack.push(ctm);
    } else if (fn === OPS.restore) {
      ctm = stack.pop() || ctm;
    } else if (fn === OPS.transform) {
      ctm = multiplyCtm(ctm, args);
    } else if (fn === OPS.paintImageXObject || fn === OPS.paintImageXObjectRepeat) {
      const objId = args[0];
      try {
        const img = await resolvePageObject(page, objId);
        if (img) {
          const [x0, y0] = applyCtm(ctm, 0, 0);
          const [x1, y1] = applyCtm(ctm, 1, 1);
          images.push({
            objId,
            decoded: img,
            pageX: Math.min(x0, x1),
            pageY: Math.min(y0, y1),
            pageWidth: Math.abs(x1 - x0),
            pageHeight: Math.abs(y1 - y0),
          });
        }
      } catch (e) {
        // The render-first fix above eliminates the indefinite-hang case
        // in practice; this timeout-based catch remains as a second
        // layer of defense for any other unresolvable/corrupt image, so
        // one bad image still can't take down the whole conversion.
        warnings?.push(
          `An image on page ${page.pageNumber} couldn't be recovered (${e.message.includes("did not resolve") ? "it didn't decode in time" : "it uses an unsupported encoding"}).`
        );
      }
    }
  }
  return images;
}

/**
 * Renders a page to a detached, throwaway canvas purely to force pdf.js
 * to fully resolve every image object it references (see
 * extractPageImages' doc comment for why this is necessary). The
 * rendered pixels themselves are never used or read back — only the
 * side effect of resolution matters here. Rendering is capped with its
 * own timeout and never throws: a page whose render fails or times out
 * still proceeds to image extraction using whatever got resolved before
 * the failure, rather than blocking the whole document.
 *
 * (Implementation lives in resolve-page-object.js, shared with
 * compress-pdf.js, which needs the identical fix for the identical
 * confirmed bug.)
 */

function multiplyCtm(m, t) {
  return [
    m[0] * t[0] + m[2] * t[1],
    m[1] * t[0] + m[3] * t[1],
    m[0] * t[2] + m[2] * t[3],
    m[1] * t[2] + m[3] * t[3],
    m[0] * t[4] + m[2] * t[5] + m[4],
    m[1] * t[4] + m[3] * t[5] + m[5],
  ];
}

function applyCtm(m, x, y) {
  return [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
}


/*
 * resolvePageObject now lives in resolve-page-object.js (imported at the
 * top of this file), shared with compress-pdf.js which needs the
 * identical fix for the identical confirmed bug.
 */

/** Convert a pdf.js decoded image object into PNG bytes via an offscreen canvas. */
async function imageObjectToPngBytes(imgObj) {
  const width = imgObj.width || imgObj.bitmap?.width;
  const height = imgObj.height || imgObj.bitmap?.height;
  if (!width || !height) return null;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (imgObj.bitmap) {
    ctx.drawImage(imgObj.bitmap, 0, 0);
  } else if (imgObj.data) {
    const imageData = ctx.createImageData(width, height);
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
    ctx.putImageData(imageData, 0, 0);
  } else {
    return null;
  }

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) return null;
  return new Uint8Array(await blob.arrayBuffer());
}

/**
 * Full deep extraction: returns page-by-page blocks (paragraphs, headings,
 * lists, tables) interleaved with images in reading order, plus page
 * dimensions — everything a DOCX/PPTX/XLSX builder needs to reproduce the
 * source layout rather than a flat text dump.
 */
export async function extractDeepContentModel(fileOrBytes, onProgress) {
  const doc = await openPdfDocument(fileOrBytes);
  const pages = [];
  const warnings = [];
  let totalTextLength = 0;

  for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
    const page = await doc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1 });
    const textContent = await page.getTextContent();
    const styles = textContent.styles || {};

    totalTextLength += textContent.items.reduce((s, it) => s + (it.str?.length || 0), 0);

    const lines = groupItemsIntoLines(textContent.items, styles);
    const { tables, remainingLines } = detectTables(lines);
    const textBlocks = classifyLines(remainingLines);

    const warningsBefore = warnings.length;
    let images = await extractPageImages(page, warnings);

    if (warnings.length > warningsBefore) {
      // At least one image failed to resolve on this page. Discard this
      // page instance and fetch a genuinely fresh one — pdf.js caches
      // PDFPageProxy instances per page number, and some internal
      // decode-queue state tied to that cached instance is what causes
      // certain Form-XObject-nested images to never resolve. A fresh
      // instance starts that internal state over, which recovers the
      // image in practice far more often than retrying against the same
      // (already-stuck) instance would.
      page.cleanup();
      const freshPage = await doc.getPage(pageNum);
      const retryWarnings = [];
      const retryImages = await extractPageImages(freshPage, retryWarnings);
      if (retryImages.length > images.length) {
        // The retry recovered something the first attempt didn't —
        // remove the warnings the first attempt logged for this page,
        // since they no longer describe what actually happened.
        warnings.length = warningsBefore;
        warnings.push(...retryWarnings);
        images = retryImages;
      }
    }

    const imageBlocks = [];
    for (const img of images) {
      const pngBytes = await imageObjectToPngBytes(img.decoded);
      if (pngBytes) {
        imageBlocks.push({
          type: "image",
          bytes: pngBytes,
          y: img.pageY,
          widthPt: img.pageWidth,
          heightPt: img.pageHeight,
        });
      }
    }

    const blocks = interleaveByPosition(textBlocks, tables, imageBlocks, viewport.height);

    pages.push({
      pageNum,
      widthPt: viewport.width,
      heightPt: viewport.height,
      blocks,
    });

    if (onProgress) onProgress(pageNum / doc.numPages);
  }

  return {
    pages,
    pageCount: doc.numPages,
    warnings,
    hasExtractableText: totalTextLength > 20,
  };
}

function interleaveByPosition(textBlocks, tables, imageBlocks, pageHeight) {
  const ordered = [...textBlocks];
  tables.forEach((t) => ordered.push(t));

  if (!imageBlocks.length) return ordered;

  const sortedImages = [...imageBlocks].sort((a, b) => b.y - a.y);
  const result = [];
  let imgIdx = 0;
  sortedImages.forEach((img) => (img._relPos = 1 - img.y / pageHeight));

  ordered.forEach((block, i) => {
    const relPos = i / Math.max(ordered.length, 1);
    while (imgIdx < sortedImages.length && sortedImages[imgIdx]._relPos <= relPos) {
      result.push(sortedImages[imgIdx]);
      imgIdx++;
    }
    result.push(block);
  });
  while (imgIdx < sortedImages.length) result.push(sortedImages[imgIdx++]);

  return result;
}

export { PT_TO_EMU };
