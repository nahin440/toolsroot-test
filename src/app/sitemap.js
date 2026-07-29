import { TOOLS, CATEGORIES } from "@/lib/registry/tools";
import { BLOG_POSTS } from "@/lib/registry/blog-content";

const SITE_URL = "https://toolsroot.com";

export default function sitemap() {
  const now = new Date();

  const staticPages = ["", "/about", "/blog", "/pricing", "/privacy", "/terms", "/contact"].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "daily" : "monthly",
    priority: path === "" ? 1 : 0.5,
  }));

  const categoryPages = Object.values(CATEGORIES).map((cat) => ({
    url: `${SITE_URL}/${cat.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const toolPages = TOOLS.map((tool) => ({
    url: `${SITE_URL}/${CATEGORIES[tool.category].slug}/${tool.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  const blogPages = BLOG_POSTS.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticPages, ...categoryPages, ...toolPages, ...blogPages];
}
