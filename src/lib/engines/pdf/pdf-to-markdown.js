"use client";

/**
 * Converts a PDF's real detected structure — headings, paragraphs,
 * lists, and tables — into genuine Markdown syntax. Reuses
 * extractDeepContentModel, the same structural extraction PDF to Word
 * and PDF to Excel are built on, so headings are real detected headings
 * (not just large-looking text guessed at by font size alone) and
 * tables are real detected tables via the same column-cluster
 * detection, not lines of text that happen to contain multiple spaces.
 *
 * This is real structural extraction, not a generative summary — every
 * word of the source PDF's readable text is preserved in the output;
 * nothing is condensed, rephrased, or omitted.
 */
import { extractDeepContentModel } from "./content-extractor";

function runsToMarkdownText(runs) {
  return (runs || [])
    .map((r) => {
      let text = r.text || "";
      // Markdown's bold/italic syntax uses literal * characters, so any
      // literal asterisk already in the source text is escaped first —
      // otherwise a source PDF containing a literal "*" would corrupt
      // the Markdown structure around it once bold/italic wrapping is
      // added on top.
      text = text.replace(/\*/g, "\\*");
      if (r.bold && r.italic) text = `***${text}***`;
      else if (r.bold) text = `**${text}**`;
      else if (r.italic) text = `*${text}*`;
      return text;
    })
    .join("");
}

function escapeTableCell(text) {
  // Markdown table syntax uses | as the column separator, so a literal
  // pipe in cell content is escaped, and embedded newlines (impossible
  // within a single Markdown table row) are collapsed to a space rather
  // than silently breaking the table's row structure.
  return String(text ?? "").replace(/\|/g, "\\|").replace(/\r?\n/g, " ").trim();
}

function tableToMarkdown(rows) {
  if (!rows.length) return "";
  const [header, ...body] = rows;
  const colCount = Math.max(...rows.map((r) => r.length));
  const pad = (row) => Array.from({ length: colCount }, (_, i) => row[i] ?? "");

  const headerLine = `| ${pad(header).map(escapeTableCell).join(" | ")} |`;
  const dividerLine = `| ${new Array(colCount).fill("---").join(" | ")} |`;
  const bodyLines = body.map((row) => `| ${pad(row).map(escapeTableCell).join(" | ")} |`);

  return [headerLine, dividerLine, ...bodyLines].join("\n");
}

function blockToMarkdown(block, listCounters) {
  if (block.type === "heading") {
    const level = Math.min(6, Math.max(1, block.level || 2));
    return `${"#".repeat(level)} ${runsToMarkdownText(block.runs)}`;
  }
  if (block.type === "paragraph") {
    const text = runsToMarkdownText(block.runs);
    return text.trim() ? text : "";
  }
  if (block.type === "list-item") {
    const text = runsToMarkdownText(block.runs);
    if (block.ordered) {
      listCounters.ordered = (listCounters.ordered || 0) + 1;
      return `${listCounters.ordered}. ${text}`;
    }
    listCounters.ordered = 0;
    return `- ${text}`;
  }
  if (block.type === "table") {
    listCounters.ordered = 0;
    return tableToMarkdown(block.rows);
  }
  return "";
}

/**
 * @param {File} file
 * @param {(progress:number)=>void} [onProgress]
 * @returns {Promise<string>}
 */
export async function pdfToMarkdown(file, onProgress) {
  const contentModel = await extractDeepContentModel(file, (p) => onProgress?.(p * 0.9));

  const sections = contentModel.pages.map((page) => {
    const listCounters = { ordered: 0 };
    const lines = page.blocks
      .map((block) => blockToMarkdown(block, listCounters))
      .filter((line) => line !== "");
    return lines.join("\n\n");
  });

  onProgress?.(1);
  return sections.filter((s) => s.trim()).join("\n\n---\n\n");
}
