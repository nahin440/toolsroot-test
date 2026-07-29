"use client";

/**
 * Builds a real, styled DOCX from the deep content model produced by
 * content-extractor.js. Every text run keeps its source font size and
 * bold/italic; every extracted image is placed inline at its position in
 * reading order; every detected table becomes a real DOCX table with a
 * proper grid — this is what makes the output "look like the PDF" rather
 * than a plain-text dump.
 */
import {
  Document,
  Paragraph,
  TextRun,
  ImageRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  Packer,
  WidthType,
  ShadingType,
  AlignmentType,
  convertInchesToTwip,
} from "docx";

const HEADING_MAP = {
  1: HeadingLevel.HEADING_1,
  2: HeadingLevel.HEADING_2,
  3: HeadingLevel.HEADING_3,
};

function ptToHalfPoints(pt) {
  return Math.max(Math.round(pt * 2), 16); // docx TextRun `size` is in half-points
}

// Same Word-2007-safe, per-script font map used in content-extractor.js.
// Table cells lose their per-run pdf.js styling by the time they reach
// this file (they're flattened to plain strings during column
// assignment), so table text needs its own script detection pass —
// otherwise Bangla (and other non-Latin) table cells inherit the
// document's default Latin font and render as boxes in Word, exactly
// like the paragraph-text bug this mirrors.
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
  { name: "Arial", re: /[\u0600-\u06FF]/ }, // Arabic
  { name: "Arial", re: /[\u0700-\u074F]/ }, // Syriac
  { name: "David", re: /[\u0590-\u05FF]/ }, // Hebrew
  { name: "Sylfaen", re: /[\u10A0-\u10FF]/ }, // Georgian
  { name: "Sylfaen", re: /[\u0530-\u058F]/ }, // Armenian
  { name: "Ebrima", re: /[\u1200-\u137F]/ }, // Ethiopic/Amharic
];

function fontForText(text, fallback) {
  for (const { name, re } of SCRIPT_FONT_RANGES) {
    if (re.test(text || "")) return name;
  }
  return fallback;
}

function runsToTextRuns(runs) {
  if (!runs || !runs.length) return [new TextRun("")];
  return runs.map(
    (r) =>
      new TextRun({
        text: r.text,
        bold: r.bold,
        italics: r.italic,
        size: ptToHalfPoints(r.fontSize),
        // r.fontFamily already went through content-extractor's script-aware
        // resolveFontFamily(), but fontForText is a cheap, harmless
        // double-check in case a run's text mixes scripts within a single
        // merged run (e.g. Bangla label immediately followed by a Latin
        // abbreviation that got merged by mergeRunsByStyle).
        font: fontForText(r.text, r.fontFamily),
      })
  );
}

function blockToDocxElement(block, pageWidthPt, imageState) {
  if (block.type === "heading") {
    return new Paragraph({
      heading: HEADING_MAP[Math.min(block.level, 3)] || HeadingLevel.HEADING_3,
      children: runsToTextRuns(block.runs),
      spacing: { before: 240, after: 120 },
    });
  }

  if (block.type === "list-item") {
    return new Paragraph({
      children: runsToTextRuns(block.runs),
      bullet: block.ordered ? undefined : { level: 0 },
      numbering: block.ordered ? { reference: "ff-numbered-list", level: 0 } : undefined,
      spacing: { after: 80 },
    });
  }

  if (block.type === "image") {
    const maxWidthPt = pageWidthPt - 96; // account for ~0.66in margins in twips->pt terms
    let widthPt = block.widthPt || 200;
    let heightPt = block.heightPt || 150;
    if (widthPt > maxWidthPt) {
      const ratio = maxWidthPt / widthPt;
      widthPt = maxWidthPt;
      heightPt = heightPt * ratio;
    }
    // IMPORTANT (Word 2007 compatibility) — two separate bugs fixed here:
    //
    // 1. `title=""` attribute: the `docx` library defaults ImageRun's
    //    `altText` to `{ name: "", description: "", title: "" }` whenever
    //    `altText` is omitted, and that default includes an explicit
    //    `title=""` attribute on the <wp:docPr> element. That attribute
    //    isn't valid under the Word-2007-era (Transitional) OOXML schema
    //    Word 2007 validates against, even though modern Word silently
    //    accepts it — which is why this only breaks on older Word. Word
    //    2007 refuses to open such files with a generic "problems with the
    //    contents" error pointing at the image's location in document.xml.
    //    Fix: always pass an explicit altText object so no `title`
    //    attribute is ever emitted.
    //
    // 2. Duplicate docPr `id` values: the library's internal id generator
    //    (`docPropertiesUniqueNumericId`) is re-created fresh for every
    //    DocProperties instance, so it always starts back at 1 — every
    //    image in the document ends up with id="1". Word requires docPr
    //    ids (and names) to be unique and non-empty across the whole
    //    document, and duplicates cause the same "problems with the
    //    contents" open failure. Fix: generate the id ourselves from a
    //    counter shared across the whole document.
    imageState.count += 1;
    const imageIndex = imageState.count;
    return new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 120 },
      children: [
        new ImageRun({
          data: block.bytes,
          type: "png",
          transformation: {
            width: Math.round(widthPt * 1.333), // pt -> px @96dpi for docx's px-based sizing
            height: Math.round(heightPt * 1.333),
          },
          altText: {
            id: imageIndex,
            name: `Picture ${imageIndex}`,
            description: block.alt || `Image ${imageIndex}`,
            // title intentionally left unset (not just "") — see note above
          },
        }),
      ],
    });
  }

  if (block.type === "table") {
    const colCount = Math.max(...block.rows.map((r) => r.length));
    const colWidthTwip = Math.floor(convertInchesToTwip(6.2) / colCount);
    const columnWidths = new Array(colCount).fill(colWidthTwip);

    return new Table({
      columnWidths,
      width: { size: convertInchesToTwip(6.2), type: WidthType.DXA },
      rows: block.rows.map(
        (row, rIdx) =>
          new TableRow({
            children: Array.from({ length: colCount }, (_, cIdx) => {
              const text = row[cIdx] || "";
              return new TableCell({
                width: { size: colWidthTwip, type: WidthType.DXA },
                shading: rIdx === 0 ? { type: ShadingType.CLEAR, fill: "F5F5F5" } : undefined,
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text,
                        bold: rIdx === 0,
                        size: ptToHalfPoints(10),
                        font: fontForText(text, "Calibri"),
                      }),
                    ],
                  }),
                ],
              });
            }),
          })
      ),
    });
  }

  // paragraph (default)
  return new Paragraph({
    children: runsToTextRuns(block.runs),
    spacing: { after: 160 },
  });
}

/**
 * @param {{pages: Array<{widthPt:number, heightPt:number, blocks:Array}>}} contentModel
 * @param {{ocrNotice?: string}} [opts]
 */
export async function buildStyledDocx(contentModel, opts = {}) {
  const children = [];
  // Shared, mutable counter so every image across the whole document gets a
  // unique docPr name/id (Word requires this — see note in
  // blockToDocxElement's "image" branch).
  const imageState = { count: 0 };

  if (opts.ocrNotice) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: opts.ocrNotice,
            italics: true,
            size: 18,
            color: "737373",
          }),
        ],
        spacing: { after: 200 },
      })
    );
  }

  contentModel.pages.forEach((page, pIdx) => {
    page.blocks.forEach((block) => {
      children.push(blockToDocxElement(block, page.widthPt, imageState));
    });
    if (pIdx < contentModel.pages.length - 1) {
      children.push(new Paragraph({ children: [], pageBreakBefore: true }));
    }
  });

  const doc = new Document({
    // Word-2007 compatibility: the docx library defaults the document's
    // <w:compatSetting> to compatibilityMode 15 (Word 2013+). Word 2007
    // itself doesn't choke on that value, but it's part of what earlier
    // debugging pointed at as a mismatch signal — set it to 12, the
    // correct value for Word 2007, so the file reports itself accurately
    // and behaves predictably in older Word.
    compatabilityModeVersion: 12,
    numbering: {
      config: [
        {
          reference: "ff-numbered-list",
          levels: [
            {
              level: 0,
              format: "decimal",
              text: "%1.",
              alignment: AlignmentType.START,
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 12240, height: 15840 }, // US Letter, DXA
            margin: {
              top: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
            },
          },
        },
        children,
      },
    ],
  });

  return Packer.toBlob(doc);
}
