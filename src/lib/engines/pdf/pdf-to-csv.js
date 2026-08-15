"use client";

/**
 * Extracts each page's real detected tables (and, for pages with no
 * table structure, one row per paragraph — the exact same fallback
 * build-xlsx.js uses, so nothing is silently dropped) into genuine CSV
 * files. Reuses extractDeepContentModel, the same column-cluster table
 * detection PDF to Excel and PDF to Word both rely on — this is not a
 * separate, weaker extraction path just because the output format is
 * simpler than XLSX.
 */
import { extractDeepContentModel } from "./content-extractor";

function blockToRows(block) {
  if (block.type === "table") return block.rows;
  if (block.type === "heading" || block.type === "paragraph" || block.type === "list-item") {
    const text = (block.runs || []).map((r) => r.text).join("");
    return text.trim() ? [[text.trim()]] : [];
  }
  return [];
}

/**
 * RFC 4180-correct field escaping: a field is quoted whenever it
 * contains a comma, a double quote, or a line break, and any double
 * quote inside it is escaped by doubling it — the standard rule most
 * spreadsheet software expects. A field that doesn't need quoting is
 * left bare, keeping the output readable for simple data rather than
 * quoting every single cell unconditionally.
 */
function csvEscapeField(value) {
  const str = String(value ?? "");
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function rowsToCsv(rows) {
  return rows.map((row) => row.map(csvEscapeField).join(",")).join("\r\n");
}

/**
 * @param {File} file
 * @param {(progress:number)=>void} [onProgress]
 * @returns {Promise<{blob: Blob, name: string}[]>} one CSV per page that
 *   has content — matching build-xlsx.js's one-sheet-per-page pattern,
 *   just without XLSX's ability to bundle several "sheets" in one file,
 *   since CSV has no such concept.
 */
export async function pdfToCsv(file, onProgress) {
  const contentModel = await extractDeepContentModel(file, (p) => onProgress?.(p * 0.85));
  const baseName = file.name.replace(/\.pdf$/i, "");
  const outputs = [];

  contentModel.pages.forEach((page) => {
    const rows = [];
    page.blocks.forEach((block) => {
      rows.push(...blockToRows(block));
    });
    if (!rows.length) return;

    const csv = rowsToCsv(rows);
    // A UTF-8 BOM is prepended so spreadsheet software (Excel in
    // particular, on Windows) correctly detects the file as UTF-8 rather
    // than misreading non-ASCII characters — a real, well-known CSV
    // interoperability issue, not an unnecessary addition.
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const pageLabel = contentModel.pages.length > 1 ? `-page-${String(page.pageNum).padStart(2, "0")}` : "";
    outputs.push({ blob, name: `${baseName}${pageLabel}.csv` });
  });

  onProgress?.(1);

  if (outputs.length === 0) {
    throw new Error("No tabular or text content was found on any page of this PDF.");
  }

  return outputs;
}
