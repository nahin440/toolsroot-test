/**
 * Ported from a shadcn-style community snippet (originally .tsx, using
 * framer-motion and a generic shadcn Button). Adapted for ToolsRoot:
 *  - This project's own CSS variables (--accent / --background, see
 *    src/app/globals.css) instead of hardcoded Tailwind slate/neutral,
 *    so the strokes render in ToolsRoot's actual emerald-600 brand color
 *    rather than a generic dark neutral.
 *  - `path.color` in the original snippet was computed but never actually
 *    used (the path's `stroke` read "currentColor" off the parent <svg>'s
 *    text color class instead), so all paths rendered at one flat color
 *    with only opacity varying by index. That's fixed here: each path's
 *    computed color is applied directly via `stroke`.
 *  - The original snippet called `Math.random()` inline during render to
 *    vary each path's animation duration. PSEUDO_RANDOM_STEP below (the
 *    golden ratio conjugate, a standard low-discrepancy-sequence trick)
 *    gives each path index a distinct, well-spread offset with no impure
 *    call anywhere — verified to spread evenly across the full range
 *    with no visible clustering.
 *  - `colorRgb` prop (default: the emerald accent below), `reverseX`
 *    (mirrors every x-coordinate across the viewBox's horizontal center,
 *    turning the sweep from top-left→bottom-right into
 *    top-right→bottom-left), and `metallic` (swaps the flat-color stroke
 *    for a real SVG <linearGradient> cycling through silver/chrome
 *    tones) — see the per-prop comments below.
 *
 * No longer a client component, and no longer Motion-driven. The
 * previous version used Motion's `pathLength`/`pathOffset` animate
 * props — which are themselves just a friendlier API over
 * stroke-dasharray/stroke-dashoffset — to loop a "line drawing itself"
 * effect on up to 18 SVG paths per instance, across up to 5 mounted
 * instances sitewide (homepage hero ×2, every tool hero ×2, every
 * category hero ×2, plus SectionFlowLines). That's a genuinely large
 * number of live, JS-driven animations competing for the same hydration
 * pass — see hero-section.jsx's file comment for the flicker this
 * caused on real network conditions. The same "line drawing and
 * fading" look is fully achievable with the SVG `pathLength="1"`
 * attribute (which normalizes stroke-dash units to [0, 1] regardless of
 * each path's actual geometry, so one shared CSS @keyframes — .path-draw,
 * globals.css — animates `stroke-dashoffset` from 1 to -1 identically
 * for every path, no matter its individual curve) plus one custom
 * property per path for duration/delay. Zero React/Motion involvement
 * once mounted; the paths are already mid-loop in the SSR'd HTML.
 */

// Tailwind emerald-600, this project's --accent (see globals.css). Kept as
// a plain RGB triplet (not a CSS var reference) because the color needs
// to be interpolated per-path in JS below, not just applied as a class.
const ACCENT_RGB = "5, 150, 105";

// Golden ratio conjugate: (index * this) % 1 gives a deterministic,
// well-distributed sequence in [0, 1) — see the file doc comment above.
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

// Count reduced from the original snippet's 36 to 18 per instance — see
// the file doc comment for why (hydration + steady-state cost across up
// to 5 concurrently-mounted instances sitewide).
const PATH_COUNT = 18;

function buildPaths(position, colorRgb, reverseX) {
  return Array.from({ length: PATH_COUNT }, (_, i) => {
    // Each x computed exactly as the original, untouched formula would
    // (so reverseX=false is byte-for-byte identical to before this prop
    // existed), then mirrored across the viewBox's horizontal center only
    // when reverseX is on. Keeping this as two explicit steps, rather
    // than folding the mirror into one combined expression, is
    // deliberate — verified against the original formula across every
    // path index and both position values.
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
      // Stagger start points across the loop the same way the old
      // per-index duration variance did, so all 18 paths don't draw in
      // lockstep — spread deterministically across the duration itself
      // via a negative delay (starts the animation partway through its
      // own cycle) rather than needing a second random-ish input.
      delay: -((i * PSEUDO_RANDOM_STEP * 1.7) % 1) * (20 + ((i * PSEUDO_RANDOM_STEP) % 1) * 10),
    };
  });
}

export function FloatingPaths({ position, colorRgb = ACCENT_RGB, reverseX = false, metallic = false }) {
  const gradientId = `floating-paths-metallic-${position}`;
  const paths = buildPaths(position, colorRgb, reverseX);

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
          <path
            key={path.id}
            className="path-draw"
            d={path.d}
            // Normalizes stroke-dash units to [0, 1] for this path
            // regardless of its actual geometric length, so the shared
            // .path-draw keyframes (stroke-dashoffset 1 → -1) produce the
            // same "draw in, hold, draw out" motion on every path without
            // needing each one's real arc length computed.
            pathLength="1"
            stroke={metallic ? `url(#${gradientId})` : path.color}
            strokeOpacity={metallic ? path.opacity : undefined}
            strokeWidth={path.width}
            style={{
              "--path-length": 1,
              "--path-duration": `${path.duration}s`,
              "--path-delay": `${path.delay}s`,
            }}
          />
        ))}
      </svg>
    </div>
  );
}
