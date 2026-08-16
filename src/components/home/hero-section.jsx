import { HiOutlineCheckCircle } from "react-icons/hi2";

import { ToolSearchBar } from "@/components/home/tool-search-bar";
import { HeroFloatingIcons } from "@/components/home/hero-floating-icons";
// import { FloatingPaths } from "@/components/ui/background-paths";
// import { OrganicBlobs } from "@/components/illustrations/organic-blobs";

// This entrance was previously JS/Motion-driven: `initial="hidden"` on
// the wrapping motion.div meant Motion server-rendered the real headline,
// subhead, badge, and search bar at literal `opacity: 0` — invisible —
// and that stayed true until React hydrated on the client and Motion's
// `animate="show"` transition fired. Locally (`next start` on
// localhost), JS arrives in single-digit milliseconds, so that
// blank-hero window is imperceptible. Over a real network — the one
// thing that actually differs on Vercel vs local prod — hydration lands
// visibly later than first paint, especially on this page: the hero
// alone used to mount two 18-path FloatingPaths instances plus
// OrganicBlobs and nine floating icons, all "use client" Motion
// components competing for the same hydration pass. The net effect was
// the site's single most important above-the-fold content (H1, subhead,
// search bar) rendering as blank, then popping in once hydration
// finally completed — read as "the page flickering" by anyone on a real
// connection.
// Fix (entrance): drive it with a plain CSS @keyframes animation
// (`.hero-fade-up`, globals.css) instead of a Motion `initial`/`animate`
// pair. CSS animations run from the moment styles are parsed — no
// hydration dependency — so the SSR-painted frame already matches the
// animation's start state.
// Fix (this file, further optimization pass): HeroFloatingIcons,
// FloatingPaths, and OrganicBlobs were the "use client" Motion
// components referenced above — all three are now plain server
// components driven by CSS animations (see each file's own comment),
// which means this component no longer needs "use client" either. The
// only genuinely-interactive piece of the hero is the search bar
// itself (real state: query text, focus, click-outside-to-close), so
// ToolSearchBar stays a client component and everything else — the
// headline, the metallic background, the decorative blobs/paths/icons —
// ships as static server-rendered HTML with zero client JS. That's the
// actual remaining flicker risk closed off: previously "no client JS
// needed to hydrate before the hero looks right" was true for the text
// (via the CSS entrance) but not for its decorative children, which
// still had to hydrate before their loops would start (they'd render
// once, statically, via Motion's `initial`, then jump to animating).
// Now nothing in the hero waits on hydration at all — every animation
// sitewide in this component, ambient or entrance, is plain CSS.
export function HeroSection() {
  return (
    <section className="relative isolate z-20">
      {/* Animated metallic background lives on its own layer, separate
          from the text content below. metal-breathe only animates
          `background-position` (see globals.css) — it used to also
          animate `filter` with `will-change: filter` set on this same
          layer, which is what actually caused this section to flicker:
          animating `filter` on a `will-change`-promoted layer is a known
          trigger for the browser/GPU to intermittently drop and
          re-rasterize the whole layer (paints blank, then repaints)
          instead of blending it smoothly — much more likely to show up
          on real deployed/GPU conditions (e.g. Vercel) than on one warm
          local dev GPU, which is exactly the "fine on localhost, flickers
          once deployed" split this was reported with. Both `filter` and
          `will-change` are gone now; the old brightness/saturate pulse is
          reproduced by .metallic-breathe-glow, a separate opacity-only
          overlay layered on top (opacity is composite-only and never
          triggers this failure mode). Keeping the background on its own
          empty absolutely-positioned div, separate from the text content,
          is still good practice so only this decorative layer ever
          repaints — but it's no longer load-bearing for the flicker fix
          the way it used to be. */}
      <div
        className=" metallic-emerald-loud pointer-events-none absolute inset-0  metallic-breathe"
        aria-hidden="true"
      />
      {/* Opacity-only brightness pulse, layered on top of the div above
          instead of inside it — see .metallic-breathe-glow in globals.css
          for why this replaced a `filter` animation on the layer itself. */}
      <div
        className="pointer-events-none absolute inset-0 metallic-breathe-glow"
        aria-hidden="true"
      />
      {/* Decorative background layer only — overflow-hidden lives here
          instead of on the section itself, so it clips the blobs/paths/
          floating icons but no longer clips the search dropdown below,
          which needs to be able to render past the hero's own bottom
          edge without getting cut off or visually detached from its
          input (see ToolSearchBar). */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {/* <OrganicBlobs tone="on-accent" /> */}
        {/* <FloatingPaths
          position={1}
          colorRgb="255, 255, 255"
          reverseX
          metallic
        />
        <FloatingPaths
          position={-1}
          colorRgb="255, 255, 255"
          reverseX
          metallic
        /> */}
      </div>
      <HeroFloatingIcons />
      <div className="relative mx-auto grid grid-cols-1 max-w-7xl  items-center gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-16 lg:py-28">
        <div className="text-center lg:text-left">
          <span
            className="hero-fade-up glass-panel inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-white"
            style={{ animationDelay: "0.05s" }}
          >
            <HiOutlineCheckCircle className="size-3.5" />
            115+ tools, entirely free
          </span>
          <h1
            className="hero-fade-up font-display mx-auto mt-6 max-w-2xl text-4xl font-semibold tracking-tight text-balance text-white sm:text-6xl lg:mx-0"
            style={{ animationDelay: "0.14s" }}
          >
            Every file tool you need, in one place
          </h1>
          <p
            className="hero-fade-up mx-auto mt-5 max-w-xl text-lg text-balance text-white/85 lg:mx-0"
            style={{ animationDelay: "0.23s" }}
          >
            Merge, convert, compress, and edit PDFs, images, documents, audio,
            and video. Free, private, and processed entirely in your browser.
          </p>
          <div
            className="hero-fade-up mt-8 flex justify-center lg:justify-start"
            style={{ animationDelay: "0.32s" }}
          >
            <ToolSearchBar />
          </div>
        </div>

        <div className="hidden lg:block" aria-hidden="true" />
      </div>
    </section>
  );
}