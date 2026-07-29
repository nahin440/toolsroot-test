import Link from "next/link";
import { createElement } from "react";
import { HiArrowRight, HiOutlineCalendar, HiOutlineClock, HiOutlineDocumentText } from "react-icons/hi2";

import { BLOG_POSTS } from "@/lib/registry/blog-content";
import { CATEGORIES } from "@/lib/registry/tools";
import { HeroIconFloat } from "@/components/shared/hero-icon-float";

const SITE_URL = "https://toolsroot.com";

export const metadata = {
  title: "Blog",
  description:
    "Practical guides on file formats, compression, and conversion — from choosing between JPG and WEBP to why your PDF looks different after converting.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Blog — Tools Root",
    description:
      "Practical guides on file formats, compression, and conversion, written to help you get better results out of everyday file tasks.",
    url: `${SITE_URL}/blog`,
  },
};

function formatDate(dateStr) {
  return new Date(dateStr + "T00:00:00Z").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

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

      <section className="relative isolate mb-6 overflow-hidden rounded-3xl bg-accent">
        <HeroIconFloat>{createElement(HiOutlineDocumentText, { className: "size-1/2" })}</HeroIconFloat>
        <div className="relative px-6 py-10 sm:px-10 sm:py-14 lg:max-w-[65%]">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Blog
          </h1>
          <p className="mt-3 text-lg text-white/85">
            Practical guides on file formats, compression, and conversion — written to help you
            get better results, not just to explain what a button does.
          </p>
        </div>
      </section>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => {
          const category = CATEGORIES[post.category];
          return (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col rounded-2xl border border-border bg-card p-5 shadow-subtle transition-all hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-card"
            >
              <span className="inline-flex w-fit items-center rounded-full bg-accent-tint px-2.5 py-1 text-xs font-medium text-accent">
                {category.shortLabel}
              </span>
              <h2 className="mt-3 font-semibold text-foreground">{post.title}</h2>
              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{post.description}</p>
              <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <HiOutlineCalendar className="size-3.5" />
                  {formatDate(post.publishedAt)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <HiOutlineClock className="size-3.5" />
                  {post.readingTime}
                </span>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent">
                Read article
                <HiArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
