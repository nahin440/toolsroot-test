"use client";

/**
 * Converts a CSV (or CSV-variant: semicolon, tab, or pipe delimited) into
 * a real .xlsx workbook via SheetJS.
 *
 * Delimiter detection matters here, not an edge case to skip: many
 * real-world CSV exports, particularly from European-locale spreadsheet
 * software, use a semicolon rather than a comma (since a comma is
 * already the decimal separator in those locales). Verified directly
 * against the installed SheetJS version that XLSX.read() does NOT
 * auto-detect this — a semicolon-delimited file passed with no explicit
 * delimiter silently parses as one single column, an incorrect result
 * that would look superficially plausible (it still produces A cell
 * per row) while being genuinely wrong. Sniffing the delimiter from the
 * first non-empty line before parsing avoids that failure mode.
 */
import * as XLSX from "xlsx";

const DELIMITER_CANDIDATES = [",", ";", "\t", "|"];

function detectDelimiter(text) {
  const firstLine = text.split(/\r\n|\n|\r/).find((l) => l.trim().length > 0) || "";
  let best = ",";
  let bestCount = -1;
  for (const d of DELIMITER_CANDIDATES) {
    const escaped = d.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const count = (firstLine.match(new RegExp(escaped, "g")) || []).length;
    if (count > bestCount) {
      bestCount = count;
      best = d;
    }
  }
  // No candidate delimiter found at all (a single-column file, or one
  // using an unrecognized separator) — default to comma, the far more
  // common case, rather than guessing at an unlisted character.
  return bestCount > 0 ? best : ",";
}

/**
 * @param {File} file
 * @returns {Promise<Blob>}
 */
export async function csvToExcel(file) {
  const text = await file.text();
  const delimiter = detectDelimiter(text);

  const workbook = XLSX.read(text, { type: "string", FS: delimiter });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // Auto-size columns based on the widest real content in each column,
  // rather than leaving SheetJS's narrow default column width — a
  // spreadsheet where every cell is truncated on open reads as broken
  // even though the underlying data is complete.
  const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false, defval: "" });
  const colCount = Math.max(...rows.map((r) => r.length), 1);
  const colWidths = new Array(colCount).fill(8);
  rows.forEach((row) => {
    row.forEach((cell, i) => {
      const len = String(cell ?? "").length;
      if (len + 2 > colWidths[i]) colWidths[i] = Math.min(len + 2, 60);
    });
  });
  worksheet["!cols"] = colWidths.map((wch) => ({ wch }));

  const outWorkbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(outWorkbook, worksheet, "Sheet1");

  const wbout = XLSX.write(outWorkbook, { bookType: "xlsx", type: "array" });
  return new Blob([wbout], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}
