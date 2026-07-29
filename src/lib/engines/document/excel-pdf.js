"use client";

/**
 * Excel <-> PDF. Excel -> PDF renders each sheet as a real HTML table
 * (preserving cell values, headers, and column structure) through the
 * same html2canvas pipeline used for HTML->PDF, so column alignment and
 * text wrapping match what a person would see opening the file in a
 * spreadsheet app. PDF -> Excel reuses the deep content-model extractor's
 * table detection (content-extractor.js) — the same real column-cluster
 * table detection used for PDF -> Word, not a separate, weaker heuristic.
 */
import * as XLSX from "xlsx";
import { htmlToPdf } from "./html-to-pdf";
import { extractDeepContentModel } from "../pdf/content-extractor";
import { buildXlsxFromContentModel } from "../pdf/build-xlsx";

function sheetToHtmlTable(worksheet, sheetName) {
  const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false, defval: "" });
  if (!rows.length) return `<h2>${sheetName}</h2><p><em>Empty sheet</em></p>`;

  const [header, ...body] = rows;
  const headerHtml = `<tr>${header.map((c) => `<th>${escapeHtml(String(c))}</th>`).join("")}</tr>`;
  const bodyHtml = body
    .map((row) => `<tr>${row.map((c) => `<td>${escapeHtml(String(c ?? ""))}</td>`).join("")}</tr>`)
    .join("");

  return `<h2>${escapeHtml(sheetName)}</h2><table>${headerHtml}${bodyHtml}</table>`;
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** @param {File|ArrayBuffer} file */
export async function excelToPdf(file, onProgress) {
  const buf = file instanceof ArrayBuffer ? file : await file.arrayBuffer();
  const workbook = XLSX.read(buf, { type: "array" });
  onProgress?.(0.15);

  const sheetsHtml = workbook.SheetNames.map((name) => sheetToHtmlTable(workbook.Sheets[name], name)).join(
    '<div style="page-break-before: always;"></div>'
  );

  return htmlToPdf(sheetsHtml, (p) => onProgress?.(0.15 + p * 0.85));
}

/** Extract tables from a PDF into a real, editable spreadsheet — one sheet per page with a detected table. */
export async function pdfToExcel(file, onProgress) {
  const contentModel = await extractDeepContentModel(file, (p) => onProgress?.(p * 0.7));
  const blob = buildXlsxFromContentModel(contentModel);
  onProgress?.(1);
  return blob;
}
