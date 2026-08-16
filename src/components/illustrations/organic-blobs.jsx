/**
 * Ditto-referenced "garden" backdrop: loose, overlapping organic blob
 * shapes in flat fills, sitting behind hero/section content as ambient
 * atmosphere. Adapted to this site's actual one-hue brand palette (four
 * tints of emerald, --blob-a through --blob-d in globals.css) rather than
 * Ditto's own multi-hue moss/fuchsia/yellow set, since this app's identity
 * is deliberately single-accent.
 *
 * Layering: designed to sit ABOVE FloatingPaths (the preserved path
 * animation) and BELOW real foreground content — i.e. it's a second
 * decorative layer, not a replacement for the path animation. Both are
 * absolutely-positioned, pointer-events-none, aria-hidden.
 *
 * `tone`:
 *   "on-accent" — blobs render as soft white silhouettes at low opacity,
 *     for use directly on a metallic-emerald hero surface (where full
 *     emerald-on-emerald blobs would be invisible, echoed against
 *     FloatingPaths' own on-accent white recolor for the same reason).
 *   "on-light" — blobs render in the actual --blob-* emerald tints, for
 *     white/near-white sections (about page panel, category strip).
 *
 * Motion: an extremely slow (24-32s), extremely subtle (±14-22px, a
 * couple degrees of rotation) drift per blob — the "living, breathing"
 * ambient cue already established by .metallic-breathe, applied to shape
 * position instead of gradient position. Never fast enough to read as
 * "an animation happening," which is what the design brief calls for:
 * atmosphere, not a flourish.
 *
 * No longer a client component. Four blobs, each drifting on a fixed,
 * non-interactive loop with no gesture/drag/physics involved — exactly
 * the kind of animation plain CSS handles natively. `.blob-drift`
 * (globals.css) is one shared @keyframes animation; each blob sets its
 * own --drift-x/--drift-y/--drift-rotate/--drift-duration/--drift-delay
 * inline instead of needing a bespoke keyframe block or a live
 * motion.svg per shape. This removes OrganicBlobs entirely from the
 * client bundle at every one of its four call sites (homepage hero, tool
 * hero, category hero, site footer) and from React's hydration work —
 * the blobs are simply already there, already drifting, in the SSR
 * HTML, no JS required. Reduced-motion is handled by the sitewide
 * prefers-reduced-motion rule in globals.css, same as every other CSS
 * animation on the site, instead of a per-component shouldReduceMotion
 * branch.
 */

const BLOB_PATHS = [
  // Large soft top-left mass
  {
    id: "a",
    d: "M120 40C220 -10 340 10 380 90C420 170 380 260 300 300C220 340 100 330 50 260C0 190 20 90 120 40Z",
    top: "-8%",
    left: "-6%",
    size: 420,
    colorVar: "--blob-a",
    opacityLight: 0.35,
    opacityAccent: 0.14,
    duration: 28,
    distanceX: 18,
    distanceY: -12.6,
    rotate: 4,
    delay: 0,
  },
  // Mid-right mass
  {
    id: "b",
    d: "M180 20C260 0 330 50 340 130C350 210 300 280 220 300C140 320 50 280 30 200C10 120 100 40 180 20Z",
    top: "6%",
    left: "62%",
    size: 340,
    colorVar: "--blob-b",
    opacityLight: 0.28,
    opacityAccent: 0.12,
    duration: 32,
    distanceX: 22,
    distanceY: -15.4,
    rotate: -5,
    delay: 1.4,
  },
  // Lower-left small accent
  {
    id: "c",
    d: "M100 10C150 -10 210 20 220 70C230 120 190 170 130 180C70 190 10 160 5 100C0 50 50 30 100 10Z",
    top: "58%",
    left: "-4%",
    size: 220,
    colorVar: "--blob-c",
    opacityLight: 0.4,
    opacityAccent: 0.16,
    duration: 24,
    distanceX: 14,
    distanceY: -9.8,
    rotate: 6,
    delay: 0.6,
  },
  // Lower-right small accent
  {
    id: "d",
    d: "M110 15C165 -8 220 25 228 78C236 131 195 178 138 188C81 198 18 168 10 108C2 48 55 38 110 15Z",
    top: "68%",
    left: "78%",
    size: 200,
    colorVar: "--blob-d",
    opacityLight: 0.32,
    opacityAccent: 0.13,
    duration: 30,
    distanceX: 16,
    distanceY: -11.2,
    rotate: -4,
    delay: 2.1,
  },
];

export function OrganicBlobs({ tone = "on-light", className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {BLOB_PATHS.map((blob) => (
        <svg
          key={blob.id}
          className="blob-drift"
          viewBox="0 0 400 340"
          width={blob.size}
          height={blob.size}
          style={{
            position: "absolute",
            top: blob.top,
            left: blob.left,
            filter: "blur(1px)",
            "--drift-x": `${blob.distanceX}px`,
            "--drift-y": `${blob.distanceY}px`,
            "--drift-rotate": `${blob.rotate}deg`,
            "--drift-duration": `${blob.duration}s`,
            "--drift-delay": `${blob.delay}s`,
          }}
        >
          <path
            d={blob.d}
            fill={`var(${blob.colorVar})`}
            opacity={tone === "on-accent" ? blob.opacityAccent : blob.opacityLight}
          />
        </svg>
      ))}
    </div>
  );
}
