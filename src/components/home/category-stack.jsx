"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";

import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

// Each card pins for this many pixels of scroll before the next one
// arrives and pushes it back. Compact by design — see file header
// comment for why this isn't a full 100dvh-per-card stack.
const PIN_BAND_PX = 340;

function StackCard({ category, tools, iconElement, index, total, scrollYProgress }) {
  // Card `index` starts shrinking/dimming as the NEXT card (index+1)
  // arrives, and is fully settled-back by the time that next card is
  // pinned. The last card never shrinks (nothing pushes it back) — same
  // "skip the final card" rule the canonical GSAP skeleton uses.
  const segment = 1 / total;
  const shrinkStart = segment * (index + 1) - segment * 0.5;
  const shrinkEnd = segment * (index + 1);

  const scale = useTransform(
    scrollYProgress,
    [shrinkStart, shrinkEnd],
    index === total - 1 ? [1, 1] : [1, 0.93]
  );
  const opacity = useTransform(
    scrollYProgress,
    [shrinkStart, shrinkEnd],
    index === total - 1 ? [1, 1] : [1, 0.6]
  );
  const translateY = useTransform(
    scrollYProgress,
    [shrinkStart, shrinkEnd],
    index === total - 1 ? [0, 0] : [0, -14]
  );
// hi
  return (
    <motion.div
      className="sticky flex items-center justify-center"
      style={{ top: 10, height: PIN_BAND_PX, scale, opacity, y: translateY, zIndex: index }}
    >
      <Link
        href={`/${category.slug}`}
        className="glossy-card glossy-card-hover group flex w-full max-w-[720px] items-center gap-6 rounded-2xl border border-border/70 bg-card p-6 shadow-float transition-[border-color] duration-150 ease-[var(--ease-standard)] hover:border-accent/30 sm:p-8"
      >
        <div className="metallic-emerald flex size-16 flex-shrink-0 items-center justify-center rounded-2xl text-white shadow-accent-glow sm:size-20">
          {iconElement}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <h3 className="font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              {category.label}
            </h3>
            <span className="flex-shrink-0 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground">
              {tools.length} tools
            </span>
          </div>
          <p className="mt-1.5 text-sm text-muted-foreground sm:text-base">{category.description}</p>
        </div>
      </Link>
    </motion.div>
  );
}

/**
 * Non-animated fallback: a plain stacked list, no sticky/scroll-linked
 * behavior at all. Used under prefers-reduced-motion instead of the
 * StackCard treatment above. Note: useScroll itself still runs in
 * CategoryStack below regardless of this branch — React's rules of hooks
 * require it be called unconditionally before any early return — but
 * StackCard (and therefore every useTransform call) never mounts when
 * this fallback renders instead, so the actual scroll-linked shrink/dim/
 * translate animation is fully skipped, just not the scroll-progress
 * tracking itself.
 */
function StaticList({ items }) {
  return (
    <div className="flex flex-col gap-4">
      {items.map(({ category, tools, iconElement }) => (
        <Link
          key={category.slug}
          href={`/${category.slug}`}
          className="glossy-card glossy-card-hover group flex items-center gap-6 rounded-2xl border border-border/70 bg-card p-6 transition-[transform,border-color] duration-150 ease-[var(--ease-standard)] hover:-translate-y-1 hover:border-accent/30 sm:p-8"
        >
          <div className="metallic-emerald flex size-16 shrink-0 items-center justify-center rounded-2xl text-white shadow-accent-glow sm:size-20">
            {iconElement}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <h3 className="font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                {category.label}
              </h3>
              <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground">
                {tools.length} tools
              </span>
            </div>
            <p className="mt-1.5 text-sm text-muted-foreground sm:text-base">{category.description}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function CategoryStack({ items }) {
  const containerRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  // target: containerRef (not the default whole-document scroll) so
  // progress runs 0->1 across exactly this section's own scroll range,
  // the same "trigger: card ... endTrigger: last card" scoping the
  // canonical GSAP skeleton sets up via ScrollTrigger.create.
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  if (shouldReduceMotion) {
    return <StaticList items={items} />;
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative")}
      style={{ height: `${items.length * PIN_BAND_PX + 20}px` }}
    >
      {items.map((item, index) => (
        <StackCard
          key={item.category.slug}
          category={item.category}
          tools={item.tools}
          iconElement={item.iconElement}
          index={index}
          total={items.length}
          scrollYProgress={scrollYProgress}
        />
      ))}
    </div>
  );
}
