"use client";

/**
 * HTML / Markdown / plain text -> PDF. HTML content is rendered using the
 * browser's OWN layout and CSS engine (via an offscreen container) and
 * captured with html2canvas-pro, then paginated into a real multi-page
 * PDF — this reproduces real CSS layout far more faithfully than
 * reimplementing an HTML renderer in pdf-lib ever could. Markdown is
 * first converted to HTML via `marked` (GFM tables/code blocks included)
 * and shares this same pipeline; plain text is wrapped in a minimal
 * styled HTML shell.
 */
import { PDFDocument } from "@cantoo/pdf-lib";
import { marked } from "marked";
import DOMPurify from "dompurify";
import html2canvas from "html2canvas-pro";

const PAGE_W_PT = 612; // US Letter
const PAGE_H_PT = 792;
const MARGIN_PT = 48;
const PX_PER_PT = 96 / 72;

const BASE_STYLES = `
  body { font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #171717; line-height: 1.6; font-size: 15px; }
  h1, h2, h3, h4 { font-weight: 600; margin-top: 1.4em; margin-bottom: 0.5em; line-height: 1.3; }
  h1 { font-size: 1.9em; } h2 { font-size: 1.5em; } h3 { font-size: 1.2em; }
  p { margin: 0.7em 0; }
  a { color: #2f9e60; }
  code { background: #f5f5f5; padding: 0.15em 0.4em; border-radius: 4px; font-family: ui-monospace, monospace; font-size: 0.9em; }
  pre { background: #f5f5f5; padding: 12px 16px; border-radius: 8px; overflow-x: auto; }
  pre code { background: none; padding: 0; }
  blockquote { border-left: 3px solid #e5e5e5; margin: 0.8em 0; padding: 0.2em 1em; color: #525252; }
  table { border-collapse: collapse; width: 100%; margin: 1em 0; }
  th, td { border: 1px solid #e5e5e5; padding: 6px 10px; text-align: left; }
  th { background: #f5f5f5; font-weight: 600; }
  img { max-width: 100%; }
  ul, ol { padding-left: 1.5em; margin: 0.6em 0; }
`;

function buildOffscreenContainer(innerHtml) {
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-99999px";
  container.style.top = "0";
  container.style.width = `${(PAGE_W_PT - MARGIN_PT * 2) * PX_PER_PT}px`;
  container.style.background = "#ffffff";
  container.style.padding = "0";

  const styleEl = document.createElement("style");
  styleEl.textContent = BASE_STYLES;

  const contentEl = document.createElement("div");
  contentEl.innerHTML = DOMPurify.sanitize(innerHtml, { ADD_TAGS: ["style"] });

  container.appendChild(styleEl);
  container.appendChild(contentEl);
  document.body.appendChild(container);
  return container;
}

async function renderContainerToPdf(container, onProgress) {
  onProgress?.(0.2);
  const fullCanvas = await html2canvas(container, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
    logging: false,
  });
  onProgress?.(0.6);

  const pxPerPtAtScale = PX_PER_PT * 2;
  const contentWidthPt = PAGE_W_PT - MARGIN_PT * 2;
  const contentHeightPt = PAGE_H_PT - MARGIN_PT * 2;
  const pageHeightPx = contentHeightPt * pxPerPtAtScale;

  const pageCount = Math.max(1, Math.ceil(fullCanvas.height / pageHeightPx));
  const doc = await PDFDocument.create();

  for (let i = 0; i < pageCount; i++) {
    const sliceCanvas = document.createElement("canvas");
    sliceCanvas.width = fullCanvas.width;
    const sliceHeightPx = Math.min(pageHeightPx, fullCanvas.height - i * pageHeightPx);
    sliceCanvas.height = sliceHeightPx;
    const ctx = sliceCanvas.getContext("2d");
    ctx.drawImage(fullCanvas, 0, i * pageHeightPx, fullCanvas.width, sliceHeightPx, 0, 0, fullCanvas.width, sliceHeightPx);

    const blob = await new Promise((resolve) => sliceCanvas.toBlob(resolve, "image/png"));
    const pngBytes = new Uint8Array(await blob.arrayBuffer());
    const embedded = await doc.embedPng(pngBytes);

    const page = doc.addPage([PAGE_W_PT, PAGE_H_PT]);
    const drawHeightPt = sliceHeightPx / pxPerPtAtScale;
    page.drawImage(embedded, {
      x: MARGIN_PT,
      y: PAGE_H_PT - MARGIN_PT - drawHeightPt,
      width: contentWidthPt,
      height: drawHeightPt,
    });

    onProgress?.(0.6 + 0.4 * ((i + 1) / pageCount));
  }

  return doc;
}

export async function htmlToPdf(htmlString, onProgress) {
  const container = buildOffscreenContainer(htmlString);
  try {
    const doc = await renderContainerToPdf(container, onProgress);
    const bytes = await doc.save();
    return new Blob([bytes], { type: "application/pdf" });
  } finally {
    container.remove();
  }
}

export async function markdownToPdf(markdownString, onProgress) {
  const html = marked.parse(markdownString, { gfm: true, breaks: false });
  return htmlToPdf(html, onProgress);
}

export async function textToPdf(text, onProgress) {
  const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const html = `<pre style="white-space: pre-wrap; font-family: ui-monospace, monospace; font-size: 13px; line-height: 1.5;">${escaped}</pre>`;
  return htmlToPdf(html, onProgress);
}
