import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/lib/admin/session";
import { BLOG_POSTS } from "@/lib/registry/blog-content";
import { TOOLS } from "@/lib/registry/tools";

const VALID_CATEGORIES = new Set(["pdf", "image", "document", "audio", "video", "archive"]);
const existingSlugs = new Set(BLOG_POSTS.map((p) => p.slug));
const validToolSlugs = new Set(TOOLS.map((t) => t.slug));

function slugify(input) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// Escapes a string for safe embedding inside a backtick template literal in
// the generated code snippet (backticks and ${...} are the two things that
// would otherwise break out of the template early or get mis-evaluated).
function escapeForTemplateLiteral(str) {
  return str.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
}

function escapeForDoubleQuoted(str) {
  return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export async function POST(request) {
  // Defense in depth: middleware already gates /admin/add-blog, but this
  // endpoint mutates content generation, so it re-checks the session
  // itself rather than trusting that every caller went through the page.
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!(await verifySessionToken(token))) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { title, description, category, content, relatedTools = [] } = body || {};
  let { slug } = body || {};

  if (!title || typeof title !== "string" || title.trim().length < 5) {
    return NextResponse.json({ error: "Title is required (at least 5 characters)." }, { status: 400 });
  }
  if (!description || typeof description !== "string" || description.trim().length < 20) {
    return NextResponse.json(
      { error: "Description is required (at least 20 characters) — this becomes the meta description." },
      { status: 400 }
    );
  }
  if (!VALID_CATEGORIES.has(category)) {
    return NextResponse.json(
      { error: `Category must be one of: ${Array.from(VALID_CATEGORIES).join(", ")}` },
      { status: 400 }
    );
  }
  if (!content || typeof content !== "string" || content.trim().length < 200) {
    return NextResponse.json(
      { error: "Content is required (at least 200 characters) — thin posts hurt SEO rather than help it." },
      { status: 400 }
    );
  }

  slug = slug && typeof slug === "string" && slug.trim() ? slugify(slug) : slugify(title);
  if (!slug) {
    return NextResponse.json({ error: "Could not derive a valid slug from the title." }, { status: 400 });
  }
  if (existingSlugs.has(slug)) {
    return NextResponse.json(
      { error: `The slug "${slug}" already exists in blog-content.js. Choose a different title or slug.` },
      { status: 409 }
    );
  }

  const cleanRelatedTools = Array.isArray(relatedTools) ? relatedTools.filter((s) => validToolSlugs.has(s)) : [];
  if (Array.isArray(relatedTools) && cleanRelatedTools.length !== relatedTools.length) {
    const unknown = relatedTools.filter((s) => !validToolSlugs.has(s));
    return NextResponse.json({ error: `Unknown tool slug(s): ${unknown.join(", ")}` }, { status: 400 });
  }

  // Word-count-based estimate at ~200 wpm, the same rate implied by the
  // existing hand-authored "X min read" values in blog-content.js.
  const plainTextWordCount = content
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  const readingTime = `${Math.max(1, Math.round(plainTextWordCount / 200))} min read`;

  const today = new Date().toISOString().slice(0, 10);

  const snippet = `  {
    slug: "${slug}",
    title: "${escapeForDoubleQuoted(title.trim())}",
    description:
      "${escapeForDoubleQuoted(description.trim())}",
    category: "${category}",
    publishedAt: "${today}",
    readingTime: "${readingTime}",
    relatedTools: [${cleanRelatedTools.map((s) => `"${s}"`).join(", ")}],
    content: \`
${escapeForTemplateLiteral(content.trim())}
\`,
  },`;

  return NextResponse.json({
    success: true,
    slug,
    readingTime,
    snippet,
    instructions:
      "Paste this object into the BLOG_POSTS array in src/lib/registry/blog-content.js (anywhere inside the array, e.g. right after the opening '['), then commit and redeploy. Vercel's serverless functions run on a read-only filesystem, so this can't be saved automatically from here — the file has to be edited and redeployed like any other code change.",
  });
}
