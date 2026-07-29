"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";

/**
 * SiteSnakes — now with a line density that matches the hero’s backdrop.
 *
 * The hero’s FloatingPaths uses 36 lines per direction × 2 directions = 72 lines
 * packed into a 316px‑tall viewBox (~0.23 lines per pixel vertically). To achieve
 * the same visual density across a full‑page document (height often > 2000px),
 * we need roughly 80 lines per group × 3 groups = 240 lines total, which gives
 * about 1 line per 8–9 pixels – identical to the hero’s density.
 *
 * Each group now uses 80 lines (was 24). The alpha and width ramps are re‑scaled
 * so they still span a nice range (0.1 → ~1.0). The animation parameters are
 * exactly the same as FloatingPaths (pathLength, opacity oscillation, pathOffset),
 * and the painter’s‑algorithm layering (emerald full‑canvas + white over accent
 * rectangles) keeps lines visible on both backgrounds.
 */

// Brand colors
const ACCENT_RGB = "5, 150, 105";
const WHITE_RGB = "255, 255, 255";

// Golden ratio conjugate – deterministic pseudo‑random spread
const PHI = 0.6180339887498949;
const pseudoRandom = (i, salt = 0) => ((i + salt) * PHI) % 1;

const DATA_ATTR = "[data-snake-tone='on-accent']";

// High line count to match hero density over full page height
// 80 lines per group → 240 total → density ≈ 1 line per 8‑9px (similar to hero)
const LINES_PER_GROUP = 80;

/**
 * Build three groups with enough lines to fill the page densely.
 * Each line gets a global index so the alpha/width ramp is continuous
 * across the entire set, just like the hero’s two directions.
 */
function buildGroups(docHeight, docWidth) {
  const lines = [];

  // Group A – right‑to‑left S‑curves (hero family)
  for (let i = 0; i < LINES_PER_GROUP; i++) {
    const globalIdx = i;
    // Spread evenly with a slight vertical jitter to avoid a rigid grid
    const bandHeight = docHeight / LINES_PER_GROUP;
    const yBase = i * bandHeight + bandHeight * 0.5 + (pseudoRandom(i, 999) - 0.5) * bandHeight * 0.3;
    const xJitter = (pseudoRandom(i, 0) - 0.5) * 220;
    const d = `M${1180 + xJitter} ${yBase - 90} C ${900 + xJitter} ${yBase - 60}, ${640 + xJitter} ${yBase + 40}, ${380 + xJitter} ${yBase + 70} C ${140 + xJitter} ${yBase + 95}, ${-80 + xJitter} ${yBase + 30}, ${-260 + xJitter} ${yBase - 20}`;
    lines.push({
      id: `a-${i}`,
      d,
      // Alpha ramps from 0.1 to ~1.0 over the 240 lines (3 groups)
      alpha: Math.min(1, 0.1 + globalIdx * 0.004), // 0.1 + 240*0.004 = 1.06 → clamp
      width: 0.5 + i * 0.015, // width also grows with index
      duration: 20 + pseudoRandom(i, 33) * 10,
    });
  }

  // Group B – vertical drift with slight horizontal wander
  for (let i = 0; i < LINES_PER_GROUP; i++) {
    const globalIdx = i + LINES_PER_GROUP;
    const xBase = (docWidth / LINES_PER_GROUP) * i + docWidth * 0.06 + (pseudoRandom(i, 111) - 0.5) * 80;
    const drift = 90 + pseudoRandom(i, 44) * 70;
    const d = `M${xBase} ${-120} C ${xBase + drift} ${docHeight * 0.18}, ${xBase - drift} ${docHeight * 0.42}, ${xBase} ${docHeight * 0.6} C ${xBase + drift * 0.7} ${docHeight * 0.78}, ${xBase - drift * 0.6} ${docHeight * 0.92}, ${xBase} ${docHeight + 120}`;
    lines.push({
      id: `b-${i}`,
      d,
      alpha: Math.min(1, 0.1 + globalIdx * 0.004),
      width: 0.5 + i * 0.015,
      duration: 18 + pseudoRandom(i, 77) * 8,
    });
  }

  // Group C – top‑right to bottom‑left diagonal
  for (let i = 0; i < LINES_PER_GROUP; i++) {
    const globalIdx = i + 2 * LINES_PER_GROUP;
    const bandHeight = docHeight / LINES_PER_GROUP;
    const yStart = i * bandHeight - docHeight * 0.08 + (pseudoRandom(i, 222) - 0.5) * bandHeight * 0.2;
    const xShift = pseudoRandom(i, 88) * 160;
    const d = `M${docWidth + 160 + xShift} ${yStart} C ${docWidth * 0.6 + xShift} ${yStart + bandHeight * 0.6}, ${docWidth * 0.35 + xShift} ${yStart + bandHeight * 1.1}, ${-160 + xShift} ${yStart + bandHeight * 1.9}`;
    lines.push({
      id: `c-${i}`,
      d,
      alpha: Math.min(1, 0.1 + globalIdx * 0.004),
      width: 0.5 + i * 0.015,
      duration: 14 + pseudoRandom(i, 121) * 6,
    });
  }

  return lines;
}

/**
 * One path rendered twice – emerald over the whole canvas, white over accent sections.
 * Both use the exact same animation as FloatingPaths (pathLength, opacity, pathOffset).
 */
function DualTonePath({ path, whiteClipId, accentClipId, reduced }) {
  const shared = reduced
    ? {
        d: path.d,
        strokeWidth: path.width,
        initial: false,
        animate: { pathLength: 1, opacity: 0.6, pathOffset: 0 },
        transition: { duration: 0 },
        fill: "none",
        strokeLinecap: "round",
      }
    : {
        d: path.d,
        strokeWidth: path.width,
        initial: { pathLength: 0.3, opacity: 0.6 },
        animate: {
          pathLength: 1,
          opacity: [0.3, 0.6, 0.3],
          pathOffset: [0, 1, 0],
        },
        transition: {
          duration: path.duration,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        },
        fill: "none",
        strokeLinecap: "round",
      };

  const emeraldStroke = `rgba(${ACCENT_RGB}, ${path.alpha})`;
  const whiteStroke = `rgba(${WHITE_RGB}, ${path.alpha})`;

  return (
    <>
      {/* Emerald layer – full canvas (visible on white backgrounds) */}
      <motion.path {...shared} stroke={emeraldStroke} clipPath={`url(#${whiteClipId})`} />
      {/* White layer – only inside accent sections (visible on emerald backgrounds) */}
      <motion.path {...shared} stroke={whiteStroke} clipPath={`url(#${accentClipId})`} />
    </>
  );
}

export function SiteSnakes() {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const containerRef = useRef(null);
  const [dims, setDims] = useState({ width: 1280, height: 2000 });
  const [accentRects, setAccentRects] = useState([]);

  // Measure document height and accent rectangles on changes
  useEffect(() => {
    function measure() {
      const doc = document.documentElement;
      const width = Math.max(doc.clientWidth, 320);
      const scrollY = window.scrollY || window.pageYOffset;

      // Measure real content height (avoid feedback loop with our own container)
      let contentBottom = window.innerHeight;
      const selfEl = containerRef.current;
      for (const child of document.body.children) {
        if (child === selfEl) continue;
        const rect = child.getBoundingClientRect();
        contentBottom = Math.max(contentBottom, rect.bottom + scrollY);
      }
      setDims({ width, height: contentBottom });

      const rects = Array.from(document.querySelectorAll(DATA_ATTR)).map((el) => {
        const r = el.getBoundingClientRect();
        return { x: r.left, y: r.top + scrollY, width: r.width, height: r.height };
      });
      setAccentRects(rects);
    }

    measure();
    const t1 = setTimeout(measure, 150);
    const t2 = setTimeout(measure, 600);

    window.addEventListener("resize", measure);
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("resize", measure);
      ro.disconnect();
    };
  }, [pathname]);

  const { width, height } = dims;

  // Build all lines (now ~240 total) with the dense count
  const lines = useMemo(() => buildGroups(height, width), [height, width]);

  const whiteClipId = "snake-clip-white";
  const accentClipId = "snake-clip-accent";

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 overflow-hidden"
      style={{ height }}
    >
      <svg
        className="h-full w-full"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        fill="none"
      >
        <title>Decorative flowing lines</title>
        <defs>
          {/* Full canvas – used for the emerald layer */}
          <clipPath id={whiteClipId}>
            <rect x={0} y={0} width={width} height={height} />
          </clipPath>
          {/* Union of accent rectangles – used for the white layer */}
          <clipPath id={accentClipId}>
            {accentRects.length === 0 ? (
              <rect x={0} y={0} width={0} height={0} />
            ) : (
              accentRects.map((r, i) => (
                <rect key={i} x={r.x} y={r.y} width={r.width} height={r.height} />
              ))
            )}
          </clipPath>
        </defs>

        {lines.map((line) => (
          <DualTonePath
            key={line.id}
            path={line}
            whiteClipId={whiteClipId}
            accentClipId={accentClipId}
            reduced={reduced}
          />
        ))}
      </svg>
    </div>
  );
}