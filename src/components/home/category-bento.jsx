"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { useReducedMotion } from "@/hooks/use-reduced-motion";

/**
 * Bento grid for "Browse by category" — replaced a sticky-stack (each
 * card pinned for a band of scroll, one revealed at a time as the next
 * pushed it back) after feedback that the pinning mechanic read as "cards
 * one by one with huge gaps between them" rather than deliberate
 * stacking. This shows every category at once, sized by real content
 * weight instead of scroll position.
 *
 * Composition (9 categories total): the first item in `items` gets the
 * hero treatment (2 cols x 2 rows); every other item is a plain 1x1 cell.
 * This tiles a 4-column grid with ZERO empty cells — verified with an
 * actual grid-auto-placement simulation before writing this file, not
 * just by eyeballing the area math (1 hero(4) + 8 singles(8) = 12 = a
 * clean 4-col x 3-row grid). `page.js` sorts `items` so the largest real
 * category (by tool count) is first, rather than this component picking
 * an arbitrary "biggest" cell — see the mandatory Bento Cell Count Rule
 * in the design-taste-frontend skill: a bento grid must have exactly as
 * many cells as it has content, never a leftover empty cell.
 *
 * Below `md:` the grid collapses to a strict single column and the hero
 * cell's span classes are dropped entirely (an asymmetric 2x2 span means
 * nothing on a 1-column layout, and the skill's mobile override for
 * asymmetric layouts is explicit about this) — every card renders at the
 * same width, ordered the same way, just stacked top to bottom.
 */

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.32, 0.72, 0, 1] } },
};

const staticVariants = {
  hidden: { opacity: 1, y: 0 },
  show: { opacity: 1, y: 0 },
};

function CategoryCard({ category, tools, iconElement, isHero }) {
  return (
    <Link
      href={`/${category.slug}`}
      className={`glossy-card glossy-card-hover group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-border/70 bg-card p-6 transition-[transform,border-color] duration-150 ease-[var(--ease-standard)] hover:-translate-y-1 hover:border-accent/30 ${
        isHero ? "sm:p-8" : ""
      }`}
    >
      <div>
        <div
          className={`metallic-emerald flex items-center justify-center rounded-2xl text-white shadow-accent-glow transition-transform duration-150 ease-[var(--ease-standard)] group-hover:scale-105 ${
            isHero ? "size-16 sm:size-20" : "size-12"
          }`}
        >
          {iconElement}
        </div>
        <h3
          className={`font-display mt-4 font-semibold tracking-tight text-foreground ${
            isHero ? "text-2xl sm:text-3xl" : "text-lg"
          }`}
        >
          {category.label}
        </h3>
        <p className={`mt-1.5 text-muted-foreground ${isHero ? "text-base sm:text-lg" : "text-sm"}`}>
          {category.description}
        </p>
      </div>
      <span className="mt-4 inline-flex w-fit flex-shrink-0 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground">
        {tools.length} tools
      </span>
    </Link>
  );
}

export function CategoryBento({ items }) {
  const shouldReduceMotion = useReducedMotion();
  const container = shouldReduceMotion ? staticVariants : containerVariants;
  const item = shouldReduceMotion ? staticVariants : itemVariants;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      // grid-auto-flow: dense (Tailwind's `grid-flow-dense`) lets the
      // single cells fill in around the hero's 2x2 span instead of
      // leaving a gap where auto-placement would otherwise skip past it
      // — this is what the auto-placement simulation actually modeled.
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 md:grid-flow-dense"
    >
      {items.map((it, index) => (
        <motion.div
          key={it.category.slug}
          variants={item}
          className={index === 0 ? "sm:col-span-2 md:col-span-2 md:row-span-2" : ""}
        >
          <CategoryCard category={it.category} tools={it.tools} iconElement={it.iconElement} isHero={index === 0} />
        </motion.div>
      ))}
    </motion.div>
  );
}
