import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createElement } from "react";
import { HiArrowRight, HiOutlineCalendar, HiOutlineClock } from "react-icons/hi2";

import { BLOG_POSTS, getBlogPost, getAllBlogSlugs, getRelatedBlogPosts } from "@/lib/registry/blog-content";
import { CATEGORIES, getTool, getToolsByCategory } from "@/lib/registry/tools";
import { getToolIcon } from "@/lib/registry/tool-icons";
import { HeroIconFloat } from "@/components/shared/hero-icon-float";

const SITE_URL = "https://toolsroot.com";

export function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `${SITE_URL}/blog/${post.slug}`,
      type: "article",
      publishedTime: post.publishedAt,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

function formatDate(dateStr) {
  return new Date(dateStr + "T00:00:00Z").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const category = CATEGORIES[post.category];
  const relatedPosts = getRelatedBlogPosts(post.slug);
  const relatedTools = post.relatedTools.map((toolSlug) => getTool(toolSlug)).filter(Boolean);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    author: { "@type": "Organization", name: "Tools Root" },
    publisher: { "@type": "Organization", name: "Tools Root", url: SITE_URL },
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: `${SITE_URL}/blog/${post.slug}` },
    ],
  };

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 sm:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/blog" className="hover:text-foreground">
          Blog
        </Link>
        <span>/</span>
        <span className="text-foreground">{category.shortLabel}</span>
      </nav>

      <article className="mt-6 max-w-3xl">
        <section className="relative isolate mb-6 -mx-4 overflow-hidden rounded-3xl metallic-emerald-soft metallic-breathe sm:-mx-6">
          {post.image?.hero && (
            <Image
              src={post.image.hero}
              alt=""
              aria-hidden="true"
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-30 mix-blend-overlay"
            />
          )}
          <HeroIconFloat className="glass-panel absolute top-1/2 right-[8%] flex size-24 -translate-y-1/2 items-center justify-center rounded-2xl text-white sm:size-28">
            {createElement(getToolIcon(getToolsByCategory(post.category)[0]?.slug), { className: "size-1/2" })}
          </HeroIconFloat>
          <div className="relative px-6 py-8 sm:px-10 sm:py-10 lg:max-w-[72%]">
            <span className="glass-panel inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-medium text-white">
              {category.shortLabel}
            </span>
            <h1 className="font-display mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {post.title}
            </h1>
            <div className="mt-3 flex items-center gap-4 text-sm text-white/80">
              <span className="inline-flex items-center gap-1.5">
                <HiOutlineCalendar className="size-4" />
                {formatDate(post.publishedAt)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <HiOutlineClock className="size-4" />
                {post.readingTime}
              </span>
            </div>
          </div>
        </section>

        <div
          className="mt-8 max-w-none space-y-4 text-base leading-relaxed text-foreground [&_a]:font-medium [&_a]:text-accent-ink [&_a]:hover:underline [&_h2]:font-display [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-foreground [&_h2]:first:mt-0 [&_p]:text-muted-foreground [&_figure]:my-8 [&_figure]:space-y-2 [&_img]:w-full [&_img]:rounded-2xl [&_img]:border [&_img]:border-border [&_img]:object-cover [&_img]:aspect-[16/9] [&_figcaption]:text-center [&_figcaption]:text-xs [&_figcaption]:text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>

      {relatedTools.length > 0 && (
        <div className="mt-12 max-w-3xl rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-semibold text-foreground">Tools mentioned in this article</h2>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {relatedTools.map((tool) => {
              const toolCategory = CATEGORIES[tool.category];
              return (
                <Link
                  key={tool.slug}
                  href={`/${toolCategory.slug}/${tool.slug}`}
                  className="group flex items-center justify-between rounded-xl border border-border px-4 py-3 text-sm font-medium text-foreground transition-colors hover:border-accent/30 hover:bg-accent-tint hover:text-accent-active"
                >
                  {tool.name}
                  <HiArrowRight className="size-4 opacity-0 transition-[transform,opacity] duration-150 ease-[var(--ease-standard)] group-hover:translate-x-0.5 group-hover:opacity-100" />
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {relatedPosts.length > 0 && (
        <div className="mt-12 max-w-3xl">
          <h2 className="font-display text-lg font-semibold text-foreground">More on {category.shortLabel.toLowerCase()} files</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {relatedPosts.map((related) => (
              <Link
                key={related.slug}
                href={`/blog/${related.slug}`}
                className="group rounded-xl border border-border p-4 text-sm transition-colors hover:border-accent/30 hover:bg-accent-tint"
              >
                <span className="font-medium text-foreground">{related.title}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
