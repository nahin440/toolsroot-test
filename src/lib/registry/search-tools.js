import { TOOLS, CATEGORIES } from "./tools";

/**
 * Lightweight relevance scoring: exact name match > name starts-with >
 * name contains > description contains. No fuzzy/typo-tolerant matching
 * library needed for a 40-tool registry — this stays instant and has
 * zero extra dependency weight.
 */
export function searchTools(query, limit = 8) {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const scored = TOOLS.map((tool) => {
    const name = tool.name.toLowerCase();
    const desc = tool.description.toLowerCase();
    let score = 0;
    if (name === q) score = 100;
    else if (name.startsWith(q)) score = 80;
    else if (name.includes(q)) score = 60;
    else if (desc.includes(q)) score = 30;
    else if (tool.slug.includes(q.replace(/\s+/g, "-"))) score = 40;
    return { tool, score };
  }).filter((r) => r.score > 0);

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((r) => ({
    ...r.tool,
    href: `/${CATEGORIES[r.tool.category].slug}/${r.tool.slug}`,
  }));
}
