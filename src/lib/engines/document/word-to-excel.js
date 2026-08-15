"use client";

/**
 * Extracts every genuine table from a Word document into a real .xlsx
 * workbook — one sheet per table, in document order. Reuses
 * readDocxContentModel, the same real .docx structural reader Word to
 * PDF is built on (reads word/document.xml's actual table markup, not
 * a text-pattern guess at what looks like tabular data).
 */
import * as XLSX from "xlsx";
import { readDocxContentModel } from "../docx/read-docx";

function autoSizeColumns(worksheet, rows) {
  const colCount = Math.max(...rows.map((r) => r.length), 1);
  const colWidths = new Array(colCount).fill(8);
  rows.forEach((row) => {
    row.forEach((cell, i) => {
      const len = String(cell ?? "").length;
      if (len + 2 > colWidths[i]) colWidths[i] = Math.min(len + 2, 60);
    });
  });
  worksheet["!cols"] = colWidths.map((wch) => ({ wch }));
}

function blockToText(block) {
  return (block.runs || []).map((r) => r.text).join("");
}

/**
 * @param {File} file
 * @returns {Promise<Blob>}
 */
export async function wordToExcel(file) {
  const model = await readDocxContentModel(file);
  const tableBlocks = model.blocks.filter((b) => b.type === "table");

  const workbook = XLSX.utils.book_new();

  if (tableBlocks.length > 0) {
    tableBlocks.forEach((block, idx) => {
      const worksheet = XLSX.utils.aoa_to_sheet(block.rows);
      autoSizeColumns(worksheet, block.rows);
      const sheetName = (tableBlocks.length > 1 ? `Table ${idx + 1}` : "Table 1").slice(0, 31);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    });
  } else {
    // No genuine table structure found — fall back to one row per
    // paragraph, the same non-destructive fallback build-xlsx.js uses
    // for PDF -> Excel, so a document with no tables still produces a
    // usable file with its real text content rather than an empty
    // workbook or a hard error.
    const rows = model.blocks
      .filter((b) => b.type === "paragraph" || b.type === "heading" || b.type === "list-item")
      .map((b) => [blockToText(b).trim()])
      .filter((r) => r[0]);
    const worksheet = XLSX.utils.aoa_to_sheet(
      rows.length ? rows : [["No tables were found in this document, and it also had no readable text content."]]
    );
    if (rows.length) autoSizeColumns(worksheet, rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  }

  const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  return new Blob([wbout], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}
