"use client";

import { useMemo, useRef } from "react";
import { motion, useInView } from "motion/react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

/**
 * Lighter-weight ambient line animation for ordinary sections (not hero
 * scale). Same visual family as the hero's FloatingPaths — same curve
 * recipe, same "36-lines, index-driven variety" DNA — but three distinct
 * directions layered together (diagonal, horizontal, vertical) at a much
 * lower combined density, since most sections are a heading + a card grid,
 * not a full-bleed hero banner.
 *
 * Why a separate file from background-paths.jsx rather than extending
 * FloatingPaths: the hero's diagonal recipe is already shipped and
 * verified (build passing, visually checked); this is deliberately a
 * different, additive piece so that work stays untouched. It shares the
 * same underlying techniques (purity-safe pseudo-random durations, RGB
 * triplet colors) but is tuned for "several light groups of lines behind
 * ordinary content," not "one dense hero backdrop."
 *
 * Density: I measured this before committing to it. Giving every
 * homepage section the hero's full 72-path (2×36) treatment would put
 * ~432 animated SVG <path> elements on one page load — way too much for
 * sections that are mostly text/cards. Here each direction gets far fewer
 * paths (diagonal: 10, horizontal: 8, vertical: 6 — 24 total per section),
 * verified by actually rendering the composed result (rsvg-convert, not
 * just reading the coordinate math) to confirm it reads as an organized,
 * layered "traffic" pattern rather than visual noise, and rendered
 * side-by-side to confirm each direction is visually distinct from the
 * others (an early version of the vertical curve looked like a second
 * diagonal until the control-point math was corrected).
 *
 * Colors: `tone="on-light"` tints lines with the emerald accent (for
 * white/light-background sections); `tone="on-accent"` tints them white
 * (for bg-accent sections, matching the hero's white-on-emerald choice).
 * Never pick the tone that matches the section's own background — e.g.
 * emerald lines on an emerald section would be invisible.
 */

const ACCENT_RGB = "5, 150, 105";
const WHITE_RGB = "255, 255, 255";

// Golden ratio conjugate — see the equivalent constant in
// background-paths.jsx for why this replaces Math.random() (a real build
// failure otherwise: Next.js's react-hooks/purity rule rejects impure
// calls anywhere reachable during render, including inside useMemo).
const PSEUDO_RANDOM_STEP = 0.6180339887498949;

function pseudoRandom(i) {
  return (i * PSEUDO_RANDOM_STEP) % 1;
}

// One diagonal sweep, top-left-to-bottom-right (mirrored to top-right-to-
// bottom-left via `position={-1}`). Same shape family as the hero's
// FloatingPaths, just a smaller count for a lighter footprint.
function diagonalPaths(count, position, colorRgb) {
  return Array.from({ length: count }, (_, i) => {
    const startX = -(200 - i * 4 * position);
    const startY = -(60 + i * 8);
    const c1x = -(200 - i * 4 * position);
    const c1y = -(60 + i * 8);
    const c2x = -(150 - i * 4 * position);
    const c2y = 90 - i * 4;
    const midX = 80 - i * 4 * position;
    const midY = 160 - i * 4;
    const c3x = 320 - i * 4 * position;
    const c3y = 230 - i * 4;
    const c4x = 380 - i * 4 * position;
    const c4y = 400 - i * 4;
    const endX = 380 - i * 4 * position;
    const endY = 400 - i * 4;
    return {
      id: `d${i}`,
      d: `M${startX} ${startY}C${c1x} ${c1y} ${c2x} ${c2y} ${midX} ${midY}C${c3x} ${c3y} ${c4x} ${c4y} ${endX} ${endY}`,
      color: `rgba(${colorRgb}, ${0.08 + i * 0.025})`,
      width: 0.4 + i * 0.025,
      duration: 20 + pseudoRandom(i) * 10,
    };
  });
}

// A near-flat horizontal sweep, right-to-left or left-to-right depending
// on `position`. Verified (see file header) to render as clearly
// horizontal rather than reading as another diagonal: dx/dy ratio is
// ~48-55 across the group.
function horizontalPaths(count, position, colorRgb) {
  return Array.from({ length: count }, (_, i) => {
    const startX = -(200 - i * 3 * position);
    const startY = 20 + i * 12;
    const endX = 900 - i * 3 * position;
    const endY = 40 + i * 12;
    const c1x = startX + (endX - startX) * 0.35;
    const c1y = startY - 40 - i * 2;
    const c2x = startX + (endX - startX) * 0.65;
    const c2y = endY + 40 + i * 2;
    return {
      id: `h${i}`,
      d: `M${startX} ${startY}C${c1x} ${c1y} ${c2x} ${c2y} ${endX} ${endY}`,
      color: `rgba(${colorRgb}, ${0.08 + i * 0.03})`,
      width: 0.4 + i * 0.03,
      duration: 20 + pseudoRandom(i + 100) * 10,
    };
  });
}

// A near-vertical sweep, up-down or down-up depending on `position`. The
// bow (`i % 3`, not `i` directly) is deliberate — an earlier version bowed
// every line further in the same direction as `i` increased, which made
// the whole group visually lean diagonally despite each line's own dy/dx
// ratio being steep. Cycling the bow keeps each line vertical on its own
// without the group accumulating a diagonal drift (confirmed by
// re-rendering after the fix).
function verticalPaths(count, position, colorRgb) {
  return Array.from({ length: count }, (_, i) => {
    const startX = 40 + i * 60;
    const startY = -80;
    const endX = startX + 10 * position;
    const endY = 420;
    const bow = 35 + (i % 3) * 8;
    const c1x = startX - bow * position;
    const c1y = startY + (endY - startY) * 0.33;
    const c2x = startX + bow * position;
    const c2y = startY + (endY - startY) * 0.66;
    return {
      id: `v${i}`,
      d: `M${startX} ${startY}C${c1x} ${c1y} ${c2x} ${c2y} ${endX} ${endY}`,
      color: `rgba(${colorRgb}, ${0.08 + i * 0.035})`,
      width: 0.4 + i * 0.035,
      duration: 20 + pseudoRandom(i + 200) * 10,
    };
  });
}

function AnimatedPathGroup({ paths, shouldReduceMotion, isInView }) {
  // isInView gates the infinite-repeat animation itself (not just an
  // entrance), so a section's 24 looping paths only actually run while
  // that section is on screen — see the export-level comment below for
  // why this matters on a page that stacks six of these instances.
  const animateInfinite = shouldReduceMotion || !isInView;
  return paths.map((path) => (
    <motion.path
      key={path.id}
      d={path.d}
      stroke={path.color}
      strokeWidth={path.width}
      initial={{ pathLength: 0.3, opacity: 0.6 }}
      // See FloatingPaths in background-paths.jsx for why this branches:
      // Motion's animate prop isn't touched by the CSS
      // prefers-reduced-motion rule in globals.css, so infinite-repeat
      // animate calls need to check the JS-level flag themselves. The
      // !isInView branch reuses the same static end-state as reduced
      // motion (rather than, say, opacity 0) — a section that's about
      // to scroll into view should show its lines already "settled"
      // rather than popping from invisible to animating.
      animate={
        animateInfinite
          ? { pathLength: 1, opacity: 0.4, pathOffset: 0 }
          : { pathLength: 1, opacity: [0.3, 0.6, 0.3], pathOffset: [0, 1, 0] }
      }
      transition={
        animateInfinite
          ? { duration: 0 }
          : { duration: path.duration, repeat: Number.POSITIVE_INFINITY, ease: "linear" }
      }
    />
  ));
}

/**
 * Drop this into any section as an absolutely-positioned first child (same
 * placement pattern as the hero's FloatingPaths/HeroFloatingIcons — before
 * the section's real content in DOM order, so it renders behind it with
 * no z-index needed).
 *
 * @param {"on-light" | "on-accent"} tone - which side of the palette to
 *   tint the lines. "on-light" = emerald lines (for white/light-bg
 *   sections). "on-accent" = white lines (for bg-accent sections).
 * @param {number} [diagonalCount=10]
 * @param {number} [horizontalCount=8]
 * @param {number} [verticalCount=6]
 */
export function SectionFlowLines({
  tone,
  diagonalCount = 10,
  horizontalCount = 8,
  verticalCount = 6,
}) {
  const shouldReduceMotion = useReducedMotion();
  const colorRgb = tone === "on-accent" ? WHITE_RGB : ACCENT_RGB;

  // The homepage alone mounts six of these (see page.js), each running
  // 24 infinite-repeat SVG paths — 144 paths total, on top of the hero's
  // own 72. None of that is free: every mounted path is a live rAF-driven
  // animation even while its section sits far off-screen (e.g. this
  // component in the CTA band at the very bottom, animating from the
  // moment the homepage loads even if the visitor never scrolls past the
  // hero). useInView gives a live boolean that flips both directions as
  // the section crosses the viewport, so AnimatedPathGroup can freeze
  // each group's paths on a static frame while off-screen and resume
  // the loop once scrolled back into view — cutting the steady-state
  // animation cost roughly in proportion to how much of the page is
  // actually visible at once, with no visual difference for a visitor
  // who's actively scrolled a section into view.
  // margin: "200px" starts the animation a little before the section
  // fully enters the viewport (rather than the exact edge), so lines are
  // already moving by the time a normal scroll brings them fully into
  // view instead of visibly kicking off mid-scroll. once: false is the
  // one deliberate difference from this codebase's other whileInView
  // usages (trust-points.jsx, category-bento.jsx, featured-guides.jsx):
  // those animate a one-shot reveal and should stay finished once
  // played; this is ambient background motion that should genuinely
  // pause and resume every time, not just on first entry.
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "200px" });

  // Same rationale as FloatingPaths' useMemo: generation is pure, so
  // only recompute when an actual input (counts, tone, direction)
  // changes rather than on every parent re-render.
  const diagonal = useMemo(() => diagonalPaths(diagonalCount, 1, colorRgb), [diagonalCount, colorRgb]);
  const horizontal = useMemo(() => horizontalPaths(horizontalCount, 1, colorRgb), [horizontalCount, colorRgb]);
  const vertical = useMemo(() => verticalPaths(verticalCount, -1, colorRgb), [verticalCount, colorRgb]);

  return (
    <div
      ref={ref}
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <svg className="w-full h-full" viewBox="0 0 696 316" fill="none" preserveAspectRatio="none">
        <title>Section flow lines</title>
        <AnimatedPathGroup paths={diagonal} shouldReduceMotion={shouldReduceMotion} isInView={isInView} />
        <AnimatedPathGroup paths={horizontal} shouldReduceMotion={shouldReduceMotion} isInView={isInView} />
        <AnimatedPathGroup paths={vertical} shouldReduceMotion={shouldReduceMotion} isInView={isInView} />
      </svg>
    </div>
  );
}
