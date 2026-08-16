import { createElement } from "react";
import { HiOutlineDocumentText } from "react-icons/hi2";

import { BLOG_POSTS } from "@/lib/registry/blog-content";
import { HeroIconFloat } from "@/components/shared/hero-icon-float";
import { BlogPostCard } from "@/components/shared/blog-post-card";
import { FloatingPaths } from "@/components/ui/background-paths";
import { OrganicBlobs } from "@/components/illustrations/organic-blobs";

const SITE_URL = "https://toolsroot.com";

export const metadata = {
  title: "Blog",
  description:
    "Practical guides on file formats, compression, and conversion. From choosing between JPG and WEBP to why your PDF looks different after converting.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Blog: Tools Root",
    description:
      "Practical guides on file formats, compression, and conversion, written to help you get better results out of everyday file tasks.",
    url: `${SITE_URL}/blog`,
  },
};

export default function BlogIndexPage() {
  const posts = [...BLOG_POSTS].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
    ],
  };

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <section className="relative isolate mb-6 overflow-hidden rounded-3xl">
        {/* Animated background isolated to its own layer — see
            hero-section.jsx for why metal-breathe (background-position
            only, no `filter`) must never sit on the same element as the
            text content, or the whole section flickers as the browser
            repaints the entire subtree every animation frame. */}
        <div
          className="pointer-events-none absolute inset-0 rounded-3xl metallic-emerald-loud metallic-breathe"
          aria-hidden="true"
        />
        {/* Opacity-only brightness pulse, layered on top of the div above
            instead of inside it — see .metallic-breathe-glow in globals.css
            for why this replaced a `filter` animation on the layer itself. */}
        <div
          className="pointer-events-none absolute inset-0 rounded-3xl metallic-breathe-glow"
          aria-hidden="true"
        />
        <OrganicBlobs tone="on-accent" />
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <FloatingPaths position={1} colorRgb="255, 255, 255" />
          <FloatingPaths position={-1} colorRgb="255, 255, 255" />
        </div>
        <HeroIconFloat>{createElement(HiOutlineDocumentText, { className: "size-1/2" })}</HeroIconFloat>
        <div className="relative px-6 py-10 sm:px-10 sm:py-14 lg:max-w-[65%]">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Blog
          </h1>
          <p className="mt-3 text-lg text-white/85">
            Practical guides on file formats, compression, and conversion. Written to help you
            get better results, not just to explain what a button does.
          </p>
        </div>
      </section>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <BlogPostCard key={post.slug} post={post} headingLevel="h2" />
        ))}
      </div>
    </div>
  );
}
