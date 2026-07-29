"use client";

/**
 * Reads the real OOXML structure of a .docx file directly (via JSZip +
 * DOMParser) rather than going through mammoth, which by its own design
 * discards exact font size/color and only preserves semantic structure
 * (see mammoth's README: "rather than attempting to exactly copy the
 * styling"). For Word -> PDF visual fidelity, we need the literal run
 * properties (`w:sz`, `w:b`, `w:i`, `w:color`, `w:rFonts`) as authored,
 * which only a direct OOXML read can give us.
 *
 * Produces a content model shaped like the PDF deep-extractor's output
 * (pages/blocks/runs) so the same PPTX/rendering logic can eventually be
 * shared, though DOCX has no fixed pages until laid out — callers get one
 * logical "page" containing the full flowed document, and true pagination
 * happens later in the PDF renderer (build-pdf-from-docx.js) once real
 * page-break decisions are made against a target page size.
 */
import JSZip from "jszip";

const W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
const R_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
const A_NS = "http://schemas.openxmlformats.org/drawingml/2006/main";

function qAll(el, tag, ns = W_NS) {
  return Array.from(el.getElementsByTagNameNS(ns, tag));
}
function q1(el, tag, ns = W_NS) {
  const list = el.getElementsByTagNameNS(ns, tag);
  return list.length ? list[0] : null;
}
function attr(el, name, ns = W_NS) {
  return el?.getAttributeNS(ns, name) ?? el?.getAttribute(`w:${name}`) ?? null;
}

function halfPointsToPt(v) {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n / 2 : 11;
}

function readRunProps(rPr) {
  if (!rPr) return { bold: false, italic: false, fontSize: 11, fontFamily: "Calibri", color: null };
  const bold = Boolean(q1(rPr, "b")) && attr(q1(rPr, "b"), "val") !== "false" && attr(q1(rPr, "b"), "val") !== "0";
  const italic = Boolean(q1(rPr, "i")) && attr(q1(rPr, "i"), "val") !== "false" && attr(q1(rPr, "i"), "val") !== "0";
  const szEl = q1(rPr, "sz");
  const fontSize = szEl ? halfPointsToPt(attr(szEl, "val")) : 11;
  const rFonts = q1(rPr, "rFonts");
  const fontFamily = rFonts ? attr(rFonts, "ascii") || attr(rFonts, "hAnsi") || "Calibri" : "Calibri";
  const colorEl = q1(rPr, "color");
  const colorVal = colorEl ? attr(colorEl, "val") : null;
  const color = colorVal && colorVal !== "auto" ? colorVal : null;
  const underline = Boolean(q1(rPr, "u")) && attr(q1(rPr, "u"), "val") !== "none";
  return { bold, italic, fontSize, fontFamily, color, underline };
}

function readParagraphStyle(pPr) {
  const styleEl = pPr ? q1(pPr, "pStyle") : null;
  const styleId = styleEl ? attr(styleEl, "val") : null;
  const alignEl = pPr ? q1(pPr, "jc") : null;
  const align = alignEl ? attr(alignEl, "val") : "left";
  const numPr = pPr ? q1(pPr, "numPr") : null;
  return { styleId, align, isListItem: Boolean(numPr) };
}

function styleIdToHeadingLevel(styleId) {
  if (!styleId) return null;
  const m = /^Heading(\d)$/i.exec(styleId) || /^heading\s*(\d)$/i.exec(styleId);
  return m ? Math.min(parseInt(m[1], 10), 3) : null;
}

async function readImageRelationships(zip, partName) {
  const relsPath = partName.replace(/^(.*)\/([^/]+)$/, "$1/_rels/$2.rels");
  const relsFile = zip.file(relsPath);
  if (!relsFile) return new Map();
  const xml = await relsFile.async("string");
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  const rels = Array.from(doc.getElementsByTagName("Relationship"));
  const map = new Map();
  for (const rel of rels) {
    const id = rel.getAttribute("Id");
    const target = rel.getAttribute("Target");
    map.set(id, target);
  }
  return map;
}

async function readDrawingImage(run, zip, relMap) {
  const blip = run.getElementsByTagNameNS(A_NS, "blip")[0];
  if (!blip) return null;
  const embedId = blip.getAttributeNS(R_NS, "embed");
  if (!embedId || !relMap.has(embedId)) return null;
  const target = relMap.get(embedId);
  const mediaPath = target.startsWith("media/") ? `word/${target}` : `word/${target}`.replace("word/word/", "word/");
  const file = zip.file(mediaPath) || zip.file(target.replace("../", "word/../"));
  if (!file) return null;
  const bytes = await file.async("uint8array");

  const extentEl = run.getElementsByTagNameNS(
    "http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing",
    "extent"
  )[0];
  let widthPt = 200;
  let heightPt = 150;
  if (extentEl) {
    const cx = parseInt(extentEl.getAttribute("cx"), 10);
    const cy = parseInt(extentEl.getAttribute("cy"), 10);
    widthPt = cx / 12700;
    heightPt = cy / 12700;
  }

  const ext = mediaPath.split(".").pop()?.toLowerCase();
  return { bytes, widthPt, heightPt, ext };
}

/**
 * @param {File|ArrayBuffer} file
 * @returns {Promise<{blocks: Array, sectionPr: object}>}
 */
export async function readDocxContentModel(file) {
  const buf = file instanceof ArrayBuffer ? file : await file.arrayBuffer();
  const zip = await JSZip.loadAsync(buf);

  const docXmlFile = zip.file("word/document.xml");
  if (!docXmlFile) throw new Error("This file doesn't look like a valid .docx (missing word/document.xml).");
  const xml = await docXmlFile.async("string");
  const doc = new DOMParser().parseFromString(xml, "application/xml");

  const relMap = await readImageRelationships(zip, "word/document.xml");

  const body = q1(doc.documentElement, "body");
  const blocks = [];

  const bodyChildren = Array.from(body.childNodes).filter((n) => n.nodeType === 1);

  for (const el of bodyChildren) {
    if (el.localName === "p") {
      const pPr = q1(el, "pPr");
      const { styleId, align, isListItem } = readParagraphStyle(pPr);
      const headingLevel = styleIdToHeadingLevel(styleId);

      const runs = [];
      const imageBlocks = [];
      const runEls = qAll(el, "r");
      for (const r of runEls) {
        const rPr = q1(r, "rPr");
        const props = readRunProps(rPr);
        const drawing = q1(r, "drawing");
        if (drawing) {
          const img = await readDrawingImage(r, zip, relMap);
          if (img) imageBlocks.push({ type: "image", ...img });
          continue;
        }
        const textEls = qAll(r, "t");
        const tabEls = qAll(r, "tab");
        let text = textEls.map((t) => t.textContent).join("");
        if (tabEls.length && !text) text = "\t";
        const brEls = qAll(r, "br");
        if (brEls.length) text += "\n";
        if (text) runs.push({ ...props, text });
      }

      imageBlocks.forEach((b) => blocks.push(b));

      if (!runs.length && !imageBlocks.length) {
        blocks.push({ type: "paragraph", runs: [{ text: "", fontSize: 11, fontFamily: "Calibri" }], align });
        continue;
      }
      if (!runs.length) continue;

      if (headingLevel) {
        blocks.push({ type: "heading", level: headingLevel, runs, align });
      } else if (isListItem) {
        blocks.push({ type: "list-item", runs, align, ordered: false });
      } else {
        blocks.push({ type: "paragraph", runs, align });
      }
    } else if (el.localName === "tbl") {
      const rows = [];
      const trEls = qAll(el, "tr");
      for (const tr of trEls) {
        const tcEls = qAll(tr, "tc");
        const cells = tcEls.map((tc) => {
          const paras = qAll(tc, "p");
          return paras
            .map((p) => qAll(p, "t").map((t) => t.textContent).join(""))
            .join("\n")
            .trim();
        });
        rows.push(cells);
      }
      if (rows.length) blocks.push({ type: "table", rows });
    }
  }

  const sectPr = q1(body, "sectPr");
  const pgSz = sectPr ? q1(sectPr, "pgSz") : null;
  const pgMar = sectPr ? q1(sectPr, "pgMar") : null;
  const twipToPt = (v) => (v ? parseInt(v, 10) / 20 : null);

  const pageWidthPt = pgSz ? twipToPt(attr(pgSz, "w")) : 612;
  const pageHeightPt = pgSz ? twipToPt(attr(pgSz, "h")) : 792;
  const margins = pgMar
    ? {
        top: twipToPt(attr(pgMar, "top")) ?? 72,
        bottom: twipToPt(attr(pgMar, "bottom")) ?? 72,
        left: twipToPt(attr(pgMar, "left")) ?? 72,
        right: twipToPt(attr(pgMar, "right")) ?? 72,
      }
    : { top: 72, bottom: 72, left: 72, right: 72 };

  return {
    blocks,
    pageWidthPt: pageWidthPt || 612,
    pageHeightPt: pageHeightPt || 792,
    margins,
  };
}
