"use client";

import { PDFDocument, StandardFonts, rgb } from "@cantoo/pdf-lib";

function hexColor(hex) {
  if (!hex || hex.length < 6) return rgb(0.1, 0.1, 0.1);
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  return rgb(r || 0, g || 0, b || 0);
}

function wrapText(text, font, size, maxWidth) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(test, size) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

export async function buildPdfFromPptxModel(model, onProgress) {
  const doc = await PDFDocument.create();
  const regularFont = await doc.embedFont(StandardFonts.Helvetica);
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
  const italicFont = await doc.embedFont(StandardFonts.HelveticaOblique);
  const boldItalicFont = await doc.embedFont(StandardFonts.HelveticaBoldOblique);

  function pickFont(bold, italic) {
    if (bold && italic) return boldItalicFont;
    if (bold) return boldFont;
    if (italic) return italicFont;
    return regularFont;
  }

  for (let i = 0; i < model.slides.length; i++) {
    const slide = model.slides[i];
    const page = doc.addPage([slide.widthPt, slide.heightPt]);

    for (const shape of slide.shapes) {
      if (!shape.xPt && shape.xPt !== 0) continue; // shapes without a resolvable position are skipped

      if (shape.type === "image") {
        try {
          const embedded = /png/i.test(shape.ext) ? await doc.embedPng(shape.bytes) : await doc.embedJpg(shape.bytes);
          page.drawImage(embedded, {
            x: shape.xPt,
            y: slide.heightPt - shape.yPt - shape.heightPt,
            width: shape.widthPt,
            height: shape.heightPt,
          });
        } catch {
          // Unsupported embedded image format (e.g. EMF/WMF) — skip rather than abort the slide.
        }
        continue;
      }

      if (shape.type === "table" && shape.rows?.length) {
        const colCount = Math.max(...shape.rows.map((r) => r.length));
        const colWidth = shape.widthPt / colCount;
        const rowHeight = shape.heightPt / shape.rows.length;
        shape.rows.forEach((row, rIdx) => {
          row.forEach((cell, cIdx) => {
            const cellX = shape.xPt + cIdx * colWidth;
            const cellY = slide.heightPt - shape.yPt - (rIdx + 1) * rowHeight;
            page.drawRectangle({
              x: cellX,
              y: cellY,
              width: colWidth,
              height: rowHeight,
              borderColor: rgb(0.85, 0.85, 0.85),
              borderWidth: 0.5,
              color: rIdx === 0 ? rgb(0.96, 0.96, 0.96) : undefined,
            });
            page.drawText(cell.slice(0, 60), {
              x: cellX + 4,
              y: cellY + rowHeight / 2 - 4,
              size: 9,
              font: rIdx === 0 ? boldFont : regularFont,
              color: rgb(0.1, 0.1, 0.1),
            });
          });
        });
        continue;
      }

      if (shape.type === "text") {
        let cursorY = slide.heightPt - shape.yPt;
        const allRuns = shape.paragraphs.flatMap((p) => (p.runs.length ? p.runs : [{ text: "", fontSize: 12 }]));
        const avgSize = allRuns.length
          ? allRuns.reduce((s, r) => s + (r.fontSize || 12), 0) / allRuns.length
          : 12;

        for (const para of shape.paragraphs) {
          if (!para.runs.length) {
            cursorY -= avgSize * 1.3;
            continue;
          }
          for (const run of para.runs) {
            if (!run.text.trim()) continue;
            const font = pickFont(run.bold, run.italic);
            const lines = wrapText(run.text, font, run.fontSize, shape.widthPt);
            for (const line of lines) {
              cursorY -= run.fontSize * 1.25;
              page.drawText(line, {
                x: shape.xPt,
                y: cursorY,
                size: run.fontSize,
                font,
                color: run.color ? hexColor(run.color) : rgb(0.1, 0.1, 0.1),
              });
            }
          }
        }
      }
    }

    onProgress?.((i + 1) / model.slides.length);
  }

  const bytes = await doc.save();
  return new Blob([bytes], { type: "application/pdf" });
}
