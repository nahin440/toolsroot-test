"use client";

/**
 * Compare PDF — extracts each page's real text content via pdf.js
 * (getTextContent, the standard extraction API — the same one pdf.js
 * itself uses to power its "select text" and search features) and runs
 * a genuine line-level diff between the two documents.
 *
 * The diff itself is a real LCS (longest common subsequence) alignment,
 * not a naive line-by-line index comparison. A naive comparison
 * ("line 5 of file A" vs "line 5 of file B") falls apart the moment a
 * single line is inserted or deleted anywhere earlier in the document —
 * every line after that point would incorrectly show as changed. LCS
 * finds the longest run of lines that appear in the same relative order
 * in both documents, so a single inserted paragraph shows as exactly
 * one insertion, not a cascade of false changes through the rest of the
 * file. This is the same principle behind `diff`/git diff, implemented
 * directly rather than pulled in as a dependency for something this
 * self-contained and correctness-critical to get exactly right.
 */

async function extractPageLines(doc, pageNum) {
  const page = await doc.getPage(pageNum);
  const content = await page.getTextContent();

  // pdf.js returns text as a flat stream of positioned items, not
  // pre-grouped lines — hasEOL marks explicit line breaks in the
  // content stream, and a meaningful Y-position jump between
  // consecutive items (this page's own line height) also starts a new
  // line, since not every real-world PDF's content stream marks EOL
  // for soft-wrapped or explicitly-positioned text.
  const lines = [];
  let current = "";
  let lastY = null;

  for (const item of content.items) {
    if (item.str === undefined) continue;
    const y = item.transform[5];
    const fontHeight = Math.abs(item.transform[3]) || 10;

    if (lastY !== null && Math.abs(y - lastY) > fontHeight * 0.5 && current.trim()) {
      lines.push(current.trim());
      current = "";
    }

    current += item.str;
    lastY = y;

    if (item.hasEOL) {
      lines.push(current.trim());
      current = "";
      lastY = null;
    }
  }
  if (current.trim()) lines.push(current.trim());

  return lines.filter((l) => l.length > 0);
}

/**
 * Real LCS-based line diff. Returns an ordered list of
 * {type: "same"|"added"|"removed", text} entries — the standard shape
 * for rendering a unified or side-by-side diff view.
 */
function diffLines(linesA, linesB) {
  const n = linesA.length;
  const m = linesB.length;

  // Standard O(n*m) LCS dynamic-programming table. PDFs are compared
  // page-by-page (see comparePdfs below), which keeps n and m bounded
  // to a single page's line count rather than a whole document's, so
  // this stays fast in practice without needing the more complex
  // linear-space Myers variant.
  const dp = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = linesA[i] === linesB[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const result = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (linesA[i] === linesB[j]) {
      result.push({ type: "same", text: linesA[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      result.push({ type: "removed", text: linesA[i] });
      i++;
    } else {
      result.push({ type: "added", text: linesB[j] });
      j++;
    }
  }
  while (i < n) {
    result.push({ type: "removed", text: linesA[i] });
    i++;
  }
  while (j < m) {
    result.push({ type: "added", text: linesB[j] });
    j++;
  }

  return result;
}

/**
 * Compare two PDFs page by page.
 * @param {File} fileA
 * @param {File} fileB
 * @param {(progress:number)=>void} [onProgress]
 * @returns {Promise<{
 *   pageCountA: number, pageCountB: number,
 *   pages: {pageNum: number, inA: boolean, inB: boolean, diff: {type:string,text:string}[], changeCount: number}[],
 *   totalChanges: number
 * }>}
 */
export async function comparePdfs(fileA, fileB, onProgress) {
  const { openPdfDocument } = await import("./pdfjs-loader");
  const [docA, docB] = await Promise.all([openPdfDocument(fileA), openPdfDocument(fileB)]);

  const maxPages = Math.max(docA.numPages, docB.numPages);
  const pages = [];
  let totalChanges = 0;

  for (let p = 1; p <= maxPages; p++) {
    const inA = p <= docA.numPages;
    const inB = p <= docB.numPages;
    const linesA = inA ? await extractPageLines(docA, p) : [];
    const linesB = inB ? await extractPageLines(docB, p) : [];
    const diff = diffLines(linesA, linesB);
    const changeCount = diff.filter((d) => d.type !== "same").length;
    totalChanges += changeCount;

    pages.push({ pageNum: p, inA, inB, diff, changeCount });
    onProgress?.(p / maxPages);
  }

  return { pageCountA: docA.numPages, pageCountB: docB.numPages, pages, totalChanges };
}
