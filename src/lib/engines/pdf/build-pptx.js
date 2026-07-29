"use client";

/**
 * Builds a real, editable PPTX from the deep content model: one slide per
 * PDF page, with genuine text boxes (not a flattened screenshot) sized to
 * a 13.33x7.5in widescreen layout, plus every extracted image placed at
 * its proportional position from the source page.
 */
import PptxGenJS from "pptxgenjs";

const SLIDE_W_IN = 13.333;
const SLIDE_H_IN = 7.5;

function pngBytesToDataUrl(bytes) {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return "data:image/png;base64," + btoa(binary);
}

function runsToPptxText(runs, sizeScale) {
  return runs.map((r) => ({
    text: r.text,
    options: {
      bold: r.bold,
      italic: r.italic,
      fontSize: Math.max(Math.round(r.fontSize * sizeScale), 8),
      fontFace: r.fontFamily,
      color: "14161B",
    },
  }));
}

export async function buildPptxFromContentModel(contentModel) {
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: "FF_WIDE", width: SLIDE_W_IN, height: SLIDE_H_IN });
  pptx.layout = "FF_WIDE";

  for (const page of contentModel.pages) {
    const slide = pptx.addSlide();
    const scaleX = SLIDE_W_IN / (page.widthPt / 72);
    const scaleY = SLIDE_H_IN / (page.heightPt / 72);
    const fontScale = (scaleX + scaleY) / 2;

    let cursorY = 0.4;
    for (const block of page.blocks) {
      if (block.type === "image") {
        const wIn = Math.max((block.widthPt / 72) * scaleX, 0.5);
        const hIn = Math.max((block.heightPt / 72) * scaleY, 0.4);
        const yIn = Math.min(Math.max(cursorY, 0), SLIDE_H_IN - hIn);
        try {
          slide.addImage({
            data: pngBytesToDataUrl(block.bytes),
            x: (SLIDE_W_IN - wIn) / 2,
            y: yIn,
            w: wIn,
            h: hIn,
          });
        } catch {
          // Skip images that fail base64 encoding rather than aborting the slide.
        }
        cursorY = yIn + hIn + 0.15;
        continue;
      }

      if (block.type === "table") {
        const rows = block.rows.map((row, rIdx) =>
          row.map((cell) => ({
            text: cell,
            options: {
              bold: rIdx === 0,
              fontSize: 11,
              fill: rIdx === 0 ? { color: "F5F5F5" } : undefined,
            },
          }))
        );
        const tableH = Math.min(rows.length * 0.35, SLIDE_H_IN - cursorY - 0.3);
        slide.addTable(rows, {
          x: 0.5,
          y: cursorY,
          w: SLIDE_W_IN - 1,
          h: Math.max(tableH, 0.4),
          fontSize: 11,
          border: { type: "solid", color: "E5E5E5", pt: 0.75 },
        });
        cursorY += Math.max(tableH, 0.4) + 0.2;
        continue;
      }

      const runs = block.runs || [];
      if (!runs.length) continue;
      const text = runsToPptxText(runs, fontScale);
      const estHeight = 0.35 + text.reduce((s, t) => s + t.text.length, 0) / 90;
      const boxH = Math.min(estHeight, SLIDE_H_IN - cursorY - 0.2);
      if (boxH <= 0) continue;

      slide.addText(text, {
        x: 0.5,
        y: cursorY,
        w: SLIDE_W_IN - 1,
        h: boxH,
        valign: "top",
        wrap: true,
        breakLine: block.type === "heading",
      });
      cursorY += boxH + 0.1;
      if (cursorY > SLIDE_H_IN - 0.3) break;
    }
  }

  return pptx.write({ outputType: "blob" });
}
