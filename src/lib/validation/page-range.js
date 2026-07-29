/**
 * Parses a page-range string like "1,3,5-8" into a sorted, deduplicated
 * array of 1-indexed page numbers. Shared by every PDF tool that accepts
 * a page selection (rotate, delete, extract, number pages).
 *
 * @param {string} text
 * @param {number} maxPage - pages beyond this are silently clamped/ignored
 * @returns {number[]}
 */
export function parsePageRangeText(text, maxPage = Infinity) {
  if (!text || !text.trim()) return [];
  const pages = new Set();

  for (const part of text.split(",")) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    const rangeMatch = /^(\d+)\s*-\s*(\d+)$/.exec(trimmed);
    if (rangeMatch) {
      const from = Math.max(1, parseInt(rangeMatch[1], 10));
      const to = Math.min(maxPage, parseInt(rangeMatch[2], 10));
      for (let p = from; p <= to; p++) pages.add(p);
    } else if (/^\d+$/.test(trimmed)) {
      const p = parseInt(trimmed, 10);
      if (p >= 1 && p <= maxPage) pages.add(p);
    }
  }

  return [...pages].sort((a, b) => a - b);
}

export function isValidPageRangeText(text, maxPage = Infinity) {
  if (!text || !text.trim()) return true; // empty is valid (means "all")
  return /^[\d,\-\s]+$/.test(text) && parsePageRangeText(text, maxPage).length > 0;
}
