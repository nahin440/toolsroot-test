"use client";

/**
 * Renders a DOCX content model (from read-docx.js) into a real, paginated
 * PDF. Text is wrapped using actual glyph-width measurements from the
 * embedded font (not a character-count estimate), and pages break exactly
 * when content would overflow the page's printable height — this is what
 * makes the output "look 100% the same" rather than everything crammed
 * onto one long page or wrapped at the wrong point.
 */
import { PDFDocument, StandardFonts, rgb } from "@cantoo/pdf-lib";

const FONT_MAP = {
  Calibri: { regular: StandardFonts.Helvetica, bold: StandardFonts.HelveticaBold, italic: StandardFonts.HelveticaOblique, boldItalic: StandardFonts.HelveticaBoldOblique },
  Arial: { regular: StandardFonts.Helvetica, bold: StandardFonts.HelveticaBold, italic: StandardFonts.HelveticaOblique, boldItalic: StandardFonts.HelveticaBoldOblique },
  "Times New Roman": { regular: StandardFonts.TimesRoman, bold: StandardFonts.TimesRomanBold, italic: StandardFonts.TimesRomanItalic, boldItalic: StandardFonts.TimesRomanBoldItalic },
  "Courier New": { regular: StandardFonts.Courier, bold: StandardFonts.CourierBold, italic: StandardFonts.CourierOblique, boldItalic: StandardFonts.CourierBoldOblique },
};

function pickStandardFont(fontFamily, bold, italic) {
  const family = FONT_MAP[fontFamily] || FONT_MAP.Calibri;
  if (bold && italic) return family.boldItalic;
  if (bold) return family.bold;
  if (italic) return family.italic;
  return family.regular;
}

function hexColor(hex) {
  if (!hex || hex.length < 6) return rgb(0, 0, 0);
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  return rgb(r || 0, g || 0, b || 0);
}

/** Wrap a single run's text into as many sub-runs as fit maxWidth, using real glyph metrics. */
function wrapRun(text, font, size, maxWidth) {
  const words = text.split(/(\s+)/).filter((w) => w !== "");
  const lines = [];
  let current = "";
  let currentWidth = 0;

  for (const word of words) {
    const wWidth = font.widthOfTextAtSize(word, size);
    if (word === "\n") {
      lines.push(current);
      current = "";
      currentWidth = 0;
      continue;
    }
    if (currentWidth + wWidth > maxWidth && current.trim()) {
      lines.push(current);
      current = word.replace(/^\s+/, "");
      currentWidth = font.widthOfTextAtSize(current, size);
    } else {
      current += word;
      currentWidth += wWidth;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

/** Flattens a block's multi-run paragraph into wrapped visual lines, each a list of styled fragments. */
function layoutParagraphLines(runs, fontsByKey, maxWidth) {
  const lines = [[]];
  let cursorWidth = 0;

  for (const run of runs) {
    const fontKey = `${run.fontFamily}|${run.bold}|${run.italic}`;
    const font = fontsByKey.get(fontKey);
    const words = run.text.split(/(\s+)/).filter((w) => w !== "");

    for (const word of words) {
      if (word === "\n") {
        lines.push([]);
        cursorWidth = 0;
        continue;
      }
      const wWidth = font.widthOfTextAtSize(word, run.fontSize);
      if (cursorWidth + wWidth > maxWidth && lines[lines.length - 1].length) {
        lines.push([]);
        cursorWidth = 0;
      }
      const trimmed = cursorWidth === 0 ? word.replace(/^\s+/, "") : word;
      const trimmedWidth = font.widthOfTextAtSize(trimmed, run.fontSize);
      lines[lines.length - 1].push({ text: trimmed, run, font, width: trimmedWidth });
      cursorWidth += trimmedWidth;
    }
  }
  return lines.filter((l) => l.length);
}

export async function buildPdfFromDocxModel(model) {
  const pdfDoc = await PDFDocument.create();
  const fontCache = new Map();

  async function getFont(fontFamily, bold, italic) {
    const key = `${fontFamily}|${bold}|${italic}`;
    if (!fontCache.has(key)) {
      const std = pickStandardFont(fontFamily, bold, italic);
      fontCache.set(key, await pdfDoc.embedFont(std));
    }
    return fontCache.get(key);
  }

  const allCombos = new Set();
  model.blocks.forEach((b) => (b.runs || []).forEach((r) => allCombos.add(`${r.fontFamily}|${r.bold}|${r.italic}`)));
  const fontsByKey = new Map();
  for (const combo of allCombos) {
    const [fam, bold, italic] = combo.split("|");
    fontsByKey.set(combo, await getFont(fam, bold === "true", italic === "true"));
  }
  if (!fontsByKey.size) {
    fontsByKey.set("Calibri|false|false", await getFont("Calibri", false, false));
  }

  const { pageWidthPt, pageHeightPt, margins } = model;
  const contentWidth = pageWidthPt - margins.left - margins.right;

  let page = pdfDoc.addPage([pageWidthPt, pageHeightPt]);
  let cursorY = pageHeightPt - margins.top;

  function ensureSpace(neededHeight) {
    if (cursorY - neededHeight < margins.bottom) {
      page = pdfDoc.addPage([pageWidthPt, pageHeightPt]);
      cursorY = pageHeightPt - margins.top;
    }
  }

  for (const block of model.blocks) {
    if (block.type === "image") {
      let { bytes, ext, widthPt, heightPt } = block;
      let embedded;
      try {
        embedded = /png/i.test(ext) ? await pdfDoc.embedPng(bytes) : await pdfDoc.embedJpg(bytes);
      } catch {
        continue;
      }
      if (widthPt > contentWidth) {
        const ratio = contentWidth / widthPt;
        widthPt = contentWidth;
        heightPt *= ratio;
      }
      ensureSpace(heightPt + 12);
      cursorY -= heightPt;
      page.drawImage(embedded, {
        x: margins.left + (contentWidth - widthPt) / 2,
        y: cursorY,
        width: widthPt,
        height: heightPt,
      });
      cursorY -= 12;
      continue;
    }

    if (block.type === "table") {
      const colCount = Math.max(...block.rows.map((r) => r.length));
      const colWidth = contentWidth / colCount;
      const rowFont = fontsByKey.values().next().value;
      const cellPad = 6;
      const fontSize = 10;

      for (const [rIdx, row] of block.rows.entries()) {
        const cellLines = row.map((cell) => wrapRun(cell, rowFont, fontSize, colWidth - cellPad * 2));
        const rowHeight = Math.max(...cellLines.map((l) => l.length)) * (fontSize * 1.3) + cellPad * 2;
        ensureSpace(rowHeight);

        if (rIdx === 0) {
          page.drawRectangle({
            x: margins.left,
            y: cursorY - rowHeight,
            width: contentWidth,
            height: rowHeight,
            color: rgb(0.96, 0.96, 0.96),
          });
        }
        page.drawRectangle({
          x: margins.left,
          y: cursorY - rowHeight,
          width: contentWidth,
          height: rowHeight,
          borderColor: rgb(0.9, 0.9, 0.9),
          borderWidth: 0.75,
        });

        cellLines.forEach((lines, cIdx) => {
          lines.forEach((line, lIdx) => {
            page.drawText(line, {
              x: margins.left + cIdx * colWidth + cellPad,
              y: cursorY - cellPad - (lIdx + 1) * fontSize * 1.3 + fontSize * 0.3,
              size: fontSize,
              font: rowFont,
              color: rgb(0.04, 0.04, 0.04),
            });
          });
        });
        cursorY -= rowHeight;
      }
      cursorY -= 10;
      continue;
    }

    const isHeading = block.type === "heading";
    const runs = (block.runs || []).map((r) => ({
      ...r,
      fontSize: isHeading ? Math.max(r.fontSize, 20 - (block.level - 1) * 3) : r.fontSize,
    }));
    if (!runs.length) {
      cursorY -= 10;
      continue;
    }

    const indent = block.type === "list-item" ? 18 : 0;
    const bulletWidth = block.type === "list-item" ? 14 : 0;
    const wrapWidth = contentWidth - indent - bulletWidth;
    const lines = layoutParagraphLines(runs, fontsByKey, wrapWidth);

    for (const [idx, line] of lines.entries()) {
      const lineHeight = Math.max(...line.map((f) => f.run.fontSize)) * 1.35;
      ensureSpace(lineHeight);
      let x = margins.left + indent + bulletWidth;
      if (idx === 0 && block.type === "list-item") {
        page.drawText("•", {
          x: margins.left + indent,
          y: cursorY - lineHeight + lineHeight * 0.22,
          size: 11,
          font: fontsByKey.values().next().value,
          color: rgb(0.04, 0.04, 0.04),
        });
      }
      cursorY -= lineHeight;
      for (const frag of line) {
        if (!frag.text) continue;
        page.drawText(frag.text, {
          x,
          y: cursorY + lineHeight * 0.22,
          size: frag.run.fontSize,
          font: frag.font,
          color: frag.run.color ? hexColor(frag.run.color) : rgb(0.04, 0.04, 0.04),
        });
        x += frag.width;
      }
    }
    cursorY -= isHeading ? 8 : 6;
  }

  const bytes = await pdfDoc.save();
  return new Blob([bytes], { type: "application/pdf" });
}
