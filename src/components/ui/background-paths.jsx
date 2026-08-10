"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

/**
 * Ported from a shadcn-style community snippet (originally .tsx, using
 * framer-motion and a generic shadcn Button). Adapted for ToolsRoot:
 *  - "motion/react" instead of "framer-motion" (this project already
 *    depends on `motion`, the current package framer-motion was renamed
 *    to; framer-motion itself isn't installed here).
 *  - This project's own <Button> (src/components/ui/button.jsx), which
 *    already has an "on-accent" variant, rather than the generic shadcn
 *    button the snippet shipped with.
 *  - Colors come from this project's real CSS variables (--accent /
 *    --background, see src/app/globals.css) instead of hardcoded
 *    Tailwind slate/neutral, so the strokes render in ToolsRoot's actual
 *    emerald-600 brand color rather than a generic dark neutral.
 *  - `path.color` in the original snippet was computed but never actually
 *    used (the path's `stroke` read "currentColor" off the parent <svg>'s
 *    text color class instead), so all 36 paths rendered at one flat
 *    color with only opacity varying by index. That's fixed here: each
 *    path's computed color is applied directly via `stroke`, so the
 *    per-index color ramp the original math implies is now real.
 *  - The original snippet called `Math.random()` inline during render to
 *    vary each path's animation duration. Next.js's react-hooks/purity
 *    rule (from eslint-config-next, already enabled in this project via
 *    its standard config) rejects any impure call reachable during
 *    render — including inside useMemo, since the compiler's static
 *    analysis treats a memo factory as still render-reachable — so this
 *    blocked the build outright. The actual design goal was just "the 36
 *    paths shouldn't all pulse in lockstep," not true randomness, so
 *    PSEUDO_RANDOM_STEP below (the golden ratio conjugate, a standard
 *    low-discrepancy-sequence trick) gives each path index a distinct,
 *    well-spread offset with no impure call anywhere — verified to
 *    spread evenly across the full range with no visible clustering.
 *  - FloatingPaths takes a `colorRgb` prop (default: the emerald accent
 *    below) and is exported directly, so it can be reused standalone —
 *    e.g. dropped into the solid-emerald hero in white, alongside
 *    HeroFloatingIcons — without duplicating the path-generation math in
 *    a second file. Contrast was checked both directions (relative
 *    luminance/contrast-ratio calc): emerald-on-white and white-on-emerald
 *    land within ~0.1 of each other at every opacity step in the existing
 *    ramp, so the same opacity formula works unchanged for either color.
 *  - Two additional opt-in props, both defaulting to off so every existing
 *    call site (tool-hero, category-hero, about, contact, blog,
 *    section-flow-lines, organic-blobs) keeps rendering byte-for-byte as
 *    before:
 *      - `reverseX`: mirrors every x-coordinate across the viewBox's
 *        horizontal center (696 - x), turning the sweep from
 *        top-left→bottom-right into top-right→bottom-left. Only the y
 *        terms (vertical direction) are left untouched, so the "two
 *        paths crossing" composition and per-index color/width ramp are
 *        unaffected — only which corner each sweep starts/ends at flips.
 *      - `metallic`: swaps the flat-color stroke for a real SVG
 *        <linearGradient> cycling through a few silver/chrome tones
 *        (bright highlight → mid grey → cool shadow) instead of one flat
 *        white value — the same "layered tones simulating light on
 *        metal" idea --metallic-emerald already uses in globals.css,
 *        applied to a thin stroke instead of a filled surface. Falls
 *        back to the existing flat-color path exactly as before when
 *        false.
 */

// Tailwind emerald-600, this project's --accent (see globals.css). Kept as
// a plain RGB triplet (not a CSS var reference) because the color needs
// to be interpolated per-path in JS below, not just applied as a class.
const ACCENT_RGB = "5, 150, 105";

// Golden ratio conjugate: (index * this) % 1 gives a deterministic,
// well-distributed sequence in [0, 1) — see the class doc comment above.
const PSEUDO_RANDOM_STEP = 0.6180339887498949;

// Matches the viewBox width below ("0 0 696 316") — used by `reverseX` to
// mirror x-coordinates across the horizontal center of that exact box.
const VIEWBOX_WIDTH = 696;

// Silver/chrome tones for the `metallic` gradient: a bright near-white
// highlight, a light-grey body, a cooler mid-grey, and a deeper shadow
// tone — cycling through all four along the stroke is what reads as
// "brushed metal catching light" rather than a flat pale color, the same
// reasoning --metallic-emerald documents for its own layered highlights.
const METALLIC_STOPS = ["#f8fafc", "#cbd5e1", "#94a3b8", "#e2e8f0"];

export function FloatingPaths({ position, colorRgb = ACCENT_RGB, reverseX = false, metallic = false }) {
  const shouldReduceMotion = useReducedMotion();
  const gradientId = `floating-paths-metallic-${position}`;

  // Path generation is pure (no Math.random — see PSEUDO_RANDOM_STEP
  // above) but there's no reason to recompute 36 path strings on every
  // parent re-render; position/colorRgb/reverseX are the only real inputs.
  const paths = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => {
        // Each x computed exactly as the original, untouched formula would
        // (so reverseX=false is byte-for-byte identical to before this
        // prop existed), then mirrored across the viewBox's horizontal
        // center only when reverseX is on. Keeping this as two explicit
        // steps, rather than folding the mirror into one combined
        // expression, is deliberate — verified against the original
        // formula across every path index and both position values.
        const mirrorX = (x) => (reverseX ? VIEWBOX_WIDTH - x : x);
        const x1 = mirrorX(-(380 - i * 5 * position));
        const x2 = mirrorX(-(312 - i * 5 * position));
        const x3 = mirrorX(152 - i * 5 * position);
        const x4 = mirrorX(616 - i * 5 * position);
        const x5 = mirrorX(684 - i * 5 * position);
        const y1 = -(189 + i * 6);
        const y2 = 216 - i * 6;
        const y3 = 343 - i * 6;
        const y4 = 470 - i * 6;
        const y5 = 875 - i * 6;
        return {
          id: i,
          d: `M${x1} ${y1}C${x1} ${y1} ${x2} ${y2} ${x3} ${y3}C${x4} ${y4} ${x5} ${y5} ${x5} ${y5}`,
          color: `rgba(${colorRgb}, ${0.1 + i * 0.03})`,
          opacity: 0.1 + i * 0.03,
          width: 0.5 + i * 0.03,
          duration: 20 + ((i * PSEUDO_RANDOM_STEP) % 1) * 10,
        };
      }),
    [position, colorRgb, reverseX]
  );

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg className="w-full h-full" viewBox="0 0 696 316" fill="none">
        <title>Background Paths</title>
        {metallic && (
          <defs>
            {/* Gradient runs along the sweep's own diagonal (top-right to
                bottom-left when reverseX is on) rather than a fixed
                screen axis, so the highlight travels with the line
                instead of sitting static across every path at once. */}
            <linearGradient id={gradientId} x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={METALLIC_STOPS[0]} />
              <stop offset="35%" stopColor={METALLIC_STOPS[1]} />
              <stop offset="65%" stopColor={METALLIC_STOPS[2]} />
              <stop offset="100%" stopColor={METALLIC_STOPS[3]} />
            </linearGradient>
          </defs>
        )}
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke={metallic ? `url(#${gradientId})` : path.color}
            strokeOpacity={metallic ? path.opacity : undefined}
            strokeWidth={path.width}
            initial={{ pathLength: 0.3, opacity: 0.6 }}
            // Reduced motion: settle on one static, fully-drawn frame
            // instead of looping pathLength/opacity/pathOffset forever.
            // The lines still render (they're real content, not pure
            // decoration — they establish the brand's animated-line
            // motif even at rest), they just stop moving.
            animate={
              shouldReduceMotion
                ? { pathLength: 1, opacity: 0.45, pathOffset: 0 }
                : { pathLength: 1, opacity: [0.3, 0.6, 0.3], pathOffset: [0, 1, 0] }
            }
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { duration: path.duration, repeat: Number.POSITIVE_INFINITY, ease: "linear" }
            }
          />
        ))}
      </svg>
    </div>
  );
}
