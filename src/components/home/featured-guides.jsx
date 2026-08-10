"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { HiArrowRight, HiOutlineCalendar, HiOutlineClock } from "react-icons/hi2";

import { CATEGORIES } from "@/lib/registry/tools";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

/**
 * Homepage-only replacement for the plain "map BlogPostCard in a 3-col
 * grid" treatment. Deliberately a SEPARATE component rather than a
 * modification to BlogPostCard itself — that card is also used on the
 * blog index, category pages, and tool-page "Related articles" (see its
 * own file's comment), and none of those should change here.
 *
 * Layout: the newest post gets a large "featured story" treatment (bigger
 * image, serif headline at a larger size, its own CTA) on one side; the
 * next two posts stack vertically as more compact horizontal cards on the
 * other side. This gives the section real visual hierarchy — a lead story
 * plus supporting stories, the way an editorial homepage would run it —
 * instead of three identical boxes with no ordering signal beyond
 * left-to-right.
 *
 * Motion follows the exact pattern already established in
 * trust-points.jsx: whileInView + viewport once:true (reveals a single
 * time on first scroll into view, never re-triggers — see that file's
 * comment on why this keeps the motion skill's frequency gate satisfied),
 * the same [0.32, 0.72, 0, 1] ease already used site-wide for this kind
 * of reveal, and a static-variants swap under prefers-reduced-motion
 * rather than conditionally skipping Motion altogether.
 */

function formatDate(dateStr) {
  return new Date(dateStr + "T00:00:00Z").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.32, 0.72, 0, 1] } },
};

const staticVariants = {
  hidden: { opacity: 1, y: 0 },
  show: { opacity: 1, y: 0 },
};

function FeaturedCard({ post }) {
  const category = CATEGORIES[post.category];
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="glossy-card glossy-card-hover group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card transition-[transform,border-color] duration-150 ease-[var(--ease-standard)] hover:-translate-y-1 hover:border-accent/30"
    >
      {post.image?.hero && (
        <div className="relative aspect-[16/11] w-full overflow-hidden bg-secondary sm:aspect-[16/9]">
          <Image
            src={post.image.hero}
            alt={post.image.alt || post.title}
            fill
            sizes="(min-width: 1024px) 58vw, 100vw"
            loading="lazy"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {/* Gradient wash so the category badge (placed over the image,
              not below it, to give this card a more editorial feel than
              BlogPostCard's badge-then-image stack) stays legible against
              any photo. */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/0"
            aria-hidden="true"
          />
          <span className="absolute left-4 top-4 inline-flex items-center rounded-full metallic-emerald px-3 py-1 text-xs font-medium text-white shadow-accent-glow">
            {category.shortLabel}
          </span>
        </div>
      )}
      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <span className="text-xs font-medium uppercase tracking-wide text-accent">Latest guide</span>
        <h3 className="font-display mt-2 text-2xl leading-snug font-semibold tracking-tight text-foreground sm:text-3xl">
          {post.title}
        </h3>
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {post.description}
        </p>
        <div className="mt-5 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <HiOutlineCalendar className="size-3.5" />
            {formatDate(post.publishedAt)}
          </span>
          <span className="inline-flex items-center gap-1">
            <HiOutlineClock className="size-3.5" />
            {post.readingTime}
          </span>
        </div>
        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-accent">
          Read the guide
          <HiArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

function SupportingCard({ post }) {
  const category = CATEGORIES[post.category];
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="glossy-card glossy-card-hover group flex flex-1 items-center gap-4 overflow-hidden rounded-2xl border border-border/70 bg-card p-4 transition-[transform,border-color] duration-150 ease-[var(--ease-standard)] hover:-translate-y-0.5 hover:border-accent/30"
    >
      {post.image?.thumb && (
        <div className="relative size-20 flex-shrink-0 overflow-hidden rounded-xl bg-secondary sm:size-24">
          <Image
            src={post.image.thumb}
            alt={post.image.alt || post.title}
            fill
            sizes="96px"
            loading="lazy"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="inline-flex w-fit items-center rounded-full bg-accent-tint px-2 py-0.5 text-[11px] font-medium text-accent">
          {category.shortLabel}
        </span>
        <h4 className="font-display mt-1.5 line-clamp-2 text-sm leading-snug font-semibold tracking-tight text-foreground sm:text-base">
          {post.title}
        </h4>
        <span className="mt-1.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
          <HiOutlineClock className="size-3" />
          {post.readingTime}
        </span>
      </div>
      <HiArrowRight className="size-4 flex-shrink-0 self-center text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
    </Link>
  );
}

export function FeaturedGuides({ posts }) {
  const shouldReduceMotion = useReducedMotion();
  const container = shouldReduceMotion ? staticVariants : containerVariants;
  const item = shouldReduceMotion ? staticVariants : itemVariants;

  const [featured, ...rest] = posts;
  if (!featured) return null;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      className="relative grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]"
    >
      <motion.div variants={item}>
        <FeaturedCard post={featured} />
      </motion.div>
      <div className="flex flex-col gap-4">
        {rest.map((post) => (
          <motion.div key={post.slug} variants={item} className="flex flex-1">
            <SupportingCard post={post} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
