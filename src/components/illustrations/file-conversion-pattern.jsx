/**
 * Abstract "file conversion" background illustration. Loose, overlapping
 * document silhouettes at varying rotation/scale/opacity, linked by a few
 * thin directional strokes — meant to evoke "many file types, one place,
 * constantly transforming" without depicting any specific real document,
 * app, or brand.
 *
 * Deliberately sparse (per the "less content in background image, text
 * over it" instruction): every shape sits at 4-10% opacity so it reads as
 * texture behind text, never competing with it for attention.
 *
 * Uses only the site's own three-hue palette (white / black / emerald-600)
 * via currentColor + explicit emerald hex — no new colors introduced, no
 * gradients (flat fills only, consistent with the site's existing design
 * system comment in globals.css).
 *
 * Pure SVG, no external image request — this is the actual reason it was
 * built this way instead of a raster photo: zero additional bytes, no
 * decode cost, scales losslessly at any size, and can't regress the site's
 * Core Web Vitals the way an Unsplash JPEG would.
 */
export function FileConversionPattern({ className, tone = "on-accent" }) {
  const shapeColor = tone === "on-accent" ? "#ffffff" : "#059669";
  const shapeOpacity = tone === "on-accent" ? 0.14 : 0.08;
  const lineOpacity = tone === "on-accent" ? 0.22 : 0.14;

  return (
    <svg
      className={className}
      viewBox="0 0 1200 500"
      fill="none"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {/* Scattered document silhouettes — simple rounded rects with a
          folded-corner triangle, at varied rotation so nothing lines up
          into an obvious grid. */}
      <g transform="translate(120 90) rotate(-8)">
        <rect width="140" height="180" rx="10" fill={shapeColor} opacity={shapeOpacity} />
        <path d="M100 0 L140 40 L100 40 Z" fill={shapeColor} opacity={shapeOpacity * 1.4} />
      </g>

      <g transform="translate(310 220) rotate(6)">
        <rect width="110" height="145" rx="8" fill={shapeColor} opacity={shapeOpacity} />
        <path d="M80 0 L110 30 L80 30 Z" fill={shapeColor} opacity={shapeOpacity * 1.4} />
      </g>

      <g transform="translate(560 60) rotate(-4)">
        <rect width="160" height="205" rx="12" fill={shapeColor} opacity={shapeOpacity} />
        <path d="M115 0 L160 45 L115 45 Z" fill={shapeColor} opacity={shapeOpacity * 1.4} />
      </g>

      <g transform="translate(800 200) rotate(9)">
        <rect width="125" height="160" rx="9" fill={shapeColor} opacity={shapeOpacity} />
        <path d="M90 0 L125 35 L90 35 Z" fill={shapeColor} opacity={shapeOpacity * 1.4} />
      </g>

      <g transform="translate(980 60) rotate(-11)">
        <rect width="105" height="135" rx="8" fill={shapeColor} opacity={shapeOpacity} />
        <path d="M75 0 L105 28 L75 28 Z" fill={shapeColor} opacity={shapeOpacity * 1.4} />
      </g>

      <g transform="translate(60 320) rotate(4)">
        <rect width="95" height="120" rx="7" fill={shapeColor} opacity={shapeOpacity} />
        <path d="M68 0 L95 25 L68 25 Z" fill={shapeColor} opacity={shapeOpacity * 1.4} />
      </g>

      <g transform="translate(1030 300) rotate(7)">
        <rect width="130" height="165" rx="9" fill={shapeColor} opacity={shapeOpacity} />
        <path d="M93 0 L130 36 L93 36 Z" fill={shapeColor} opacity={shapeOpacity * 1.4} />
      </g>

      {/* A handful of thin directional connector strokes suggesting
          conversion/transformation between the scattered documents. Kept
          to a small number so the pattern still reads as "sparse", not a
          dense diagram. */}
      <path
        d="M290 170 C 340 150, 360 130, 400 120"
        stroke={shapeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="2 10"
        opacity={lineOpacity}
        fill="none"
      />
      <path
        d="M700 130 C 750 160, 770 190, 800 210"
        stroke={shapeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="2 10"
        opacity={lineOpacity}
        fill="none"
      />
      <path
        d="M420 300 C 480 310, 520 300, 560 280"
        stroke={shapeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="2 10"
        opacity={lineOpacity}
        fill="none"
      />
      <path
        d="M930 230 C 970 250, 990 270, 1010 290"
        stroke={shapeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="2 10"
        opacity={lineOpacity}
        fill="none"
      />
    </svg>
  );
}
