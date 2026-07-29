"use client";

/**
 * Reads the real OOXML structure of a .pptx file (via JSZip + DOMParser),
 * extracting each slide's shape tree with real positions (from `a:xfrm`
 * in EMUs), text runs with their actual font size/bold/italic/color, and
 * embedded images — the same direct-XML-read approach used for DOCX, for
 * the same reason: only reading the literal OOXML gives true visual
 * fidelity rather than a semantic-only reconstruction.
 */
import JSZip from "jszip";

const A_NS = "http://schemas.openxmlformats.org/drawingml/2006/main";
const P_NS = "http://schemas.openxmlformats.org/presentationml/2006/main";
const R_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";

const EMU_PER_PT = 12700;

function qAll(el, tag, ns = A_NS) {
  return Array.from(el.getElementsByTagNameNS(ns, tag));
}
function q1(el, tag, ns = A_NS) {
  const list = el.getElementsByTagNameNS(ns, tag);
  return list.length ? list[0] : null;
}

function readRunProps(rPr) {
  if (!rPr) return { bold: false, italic: false, fontSize: 18, color: null, fontFamily: "Calibri" };
  const bold = rPr.getAttribute("b") === "1";
  const italic = rPr.getAttribute("i") === "1";
  const szAttr = rPr.getAttribute("sz");
  const fontSize = szAttr ? parseInt(szAttr, 10) / 100 : 18;
  const fillEl = q1(rPr, "solidFill");
  const srgbEl = fillEl ? q1(fillEl, "srgbClr") : null;
  const color = srgbEl ? srgbEl.getAttribute("val") : null;
  const fontEl = q1(rPr, "latin");
  const fontFamily = fontEl ? fontEl.getAttribute("typeface") : "Calibri";
  return { bold, italic, fontSize, color, fontFamily };
}

async function readSlideRelationships(zip, slideIndex) {
  const relsFile = zip.file(`ppt/slides/_rels/slide${slideIndex}.xml.rels`);
  if (!relsFile) return new Map();
  const xml = await relsFile.async("string");
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  const rels = Array.from(doc.getElementsByTagName("Relationship"));
  const map = new Map();
  rels.forEach((r) => map.set(r.getAttribute("Id"), r.getAttribute("Target")));
  return map;
}

function readShapeXfrm(spPr) {
  const xfrm = spPr ? q1(spPr, "xfrm") : null;
  if (!xfrm) return null;
  const off = q1(xfrm, "off");
  const ext = q1(xfrm, "ext");
  if (!off || !ext) return null;
  return {
    xPt: parseInt(off.getAttribute("x"), 10) / EMU_PER_PT,
    yPt: parseInt(off.getAttribute("y"), 10) / EMU_PER_PT,
    widthPt: parseInt(ext.getAttribute("cx"), 10) / EMU_PER_PT,
    heightPt: parseInt(ext.getAttribute("cy"), 10) / EMU_PER_PT,
  };
}

async function readPicture(sp, zip, relMap) {
  const blipFill = q1(sp, "blipFill", P_NS) || q1(sp, "blipFill");
  const blip = blipFill ? q1(blipFill, "blip") : null;
  if (!blip) return null;
  const embedId = blip.getAttributeNS(R_NS, "embed");
  if (!embedId || !relMap.has(embedId)) return null;

  const target = relMap.get(embedId);
  const mediaPath = target.startsWith("../") ? `ppt/${target.replace("../", "")}` : `ppt/slides/${target}`;
  const file = zip.file(mediaPath) || zip.file(target.replace(/^\.\.\//, "ppt/"));
  if (!file) return null;
  const bytes = await file.async("uint8array");
  const ext = mediaPath.split(".").pop()?.toLowerCase();

  const xfrm = readShapeXfrm(q1(sp, "spPr", P_NS) || q1(sp, "spPr"));
  return { type: "image", bytes, ext, ...xfrm };
}

/**
 * @param {File|ArrayBuffer} file
 * @returns {Promise<{slides: Array, slideWidthPt: number, slideHeightPt: number}>}
 */
export async function readPptxContentModel(file) {
  const buf = file instanceof ArrayBuffer ? file : await file.arrayBuffer();
  const zip = await JSZip.loadAsync(buf);

  const presentationFile = zip.file("ppt/presentation.xml");
  const presentationXml = await presentationFile.async("string");
  const presentationDoc = new DOMParser().parseFromString(presentationXml, "application/xml");
  const sldSz = presentationDoc.getElementsByTagNameNS(P_NS, "sldSz")[0];
  const slideWidthPt = sldSz ? parseInt(sldSz.getAttribute("cx"), 10) / EMU_PER_PT : 720;
  const slideHeightPt = sldSz ? parseInt(sldSz.getAttribute("cy"), 10) / EMU_PER_PT : 540;

  const slideFiles = Object.keys(zip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort((a, b) => {
      const na = parseInt(a.match(/slide(\d+)\.xml/)[1], 10);
      const nb = parseInt(b.match(/slide(\d+)\.xml/)[1], 10);
      return na - nb;
    });

  const slides = [];

  for (const slidePath of slideFiles) {
    const slideIndex = parseInt(slidePath.match(/slide(\d+)\.xml/)[1], 10);
    const xml = await zip.file(slidePath).async("string");
    const doc = new DOMParser().parseFromString(xml, "application/xml");
    const relMap = await readSlideRelationships(zip, slideIndex);

    const spTree = doc.getElementsByTagNameNS(P_NS, "spTree")[0];
    const shapes = [];

    const topLevelEls = Array.from(spTree.childNodes).filter((n) => n.nodeType === 1);
    for (const el of topLevelEls) {
      if (el.localName === "sp") {
        const spPr = q1(el, "spPr", P_NS) || q1(el, "spPr");
        const xfrm = readShapeXfrm(spPr);
        const txBody = q1(el, "txBody", P_NS) || q1(el, "txBody");

        if (txBody) {
          const paragraphs = qAll(txBody, "p");
          const blocks = paragraphs.map((p) => {
            const runs = qAll(p, "r").map((r) => {
              const rPr = q1(r, "rPr");
              const props = readRunProps(rPr);
              const tEl = q1(r, "t");
              return { ...props, text: tEl ? tEl.textContent : "" };
            });
            return { runs };
          });
          shapes.push({ type: "text", ...xfrm, paragraphs: blocks });
        }
      } else if (el.localName === "pic") {
        const pic = await readPicture(el, zip, relMap);
        if (pic) shapes.push(pic);
      } else if (el.localName === "graphicFrame") {
        const tbl = q1(el, "tbl");
        if (tbl) {
          const xfrm = readShapeXfrm(q1(el, "xfrm", P_NS) || el);
          const rows = qAll(tbl, "tr").map((tr) => qAll(tr, "tc").map((tc) => qAll(tc, "t").map((t) => t.textContent).join("")));
          shapes.push({ type: "table", ...xfrm, rows });
        }
      }
    }

    slides.push({ widthPt: slideWidthPt, heightPt: slideHeightPt, shapes });
  }

  return { slides, slideWidthPt, slideHeightPt };
}
