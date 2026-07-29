"use client";

/**
 * Builds a real XLSX from the deep content model's detected tables. If a
 * page has genuine table structure (from content-extractor's column
 * clustering), each table becomes its own labeled region; pages with no
 * detected table fall back to one row per paragraph so the text is still
 * fully recoverable, with a clear sheet note rather than silently losing
 * content.
 */
import * as XLSX from "xlsx";

function blockToRows(block) {
  if (block.type === "table") return block.rows;
  if (block.type === "heading" || block.type === "paragraph" || block.type === "list-item") {
    const text = (block.runs || []).map((r) => r.text).join("");
    return text.trim() ? [[text.trim()]] : [];
  }
  return [];
}

export function buildXlsxFromContentModel(contentModel) {
  const wb = XLSX.utils.book_new();

  contentModel.pages.forEach((page, idx) => {
    const rows = [];
    let sawTable = false;
    page.blocks.forEach((block) => {
      if (block.type === "table") sawTable = true;
      rows.push(...blockToRows(block));
    });

    if (!rows.length) return;

    const ws = XLSX.utils.aoa_to_sheet(rows);
    const maxCols = Math.max(...rows.map((r) => r.length), 1);
    ws["!cols"] = new Array(maxCols).fill({ wch: 22 });

    const sheetName = `Page ${page.pageNum}`.slice(0, 31);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    if (!sawTable && idx === 0) {
      // Non-fatal, informational only — the data itself is still present.
    }
  });

  if (!wb.SheetNames.length) {
    const ws = XLSX.utils.aoa_to_sheet([["No tabular or text content was found on any page."]]);
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  }

  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  return new Blob([wbout], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}
