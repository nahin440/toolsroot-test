"use client";

import { HiOutlineCheckCircle } from "react-icons/hi2";

import { ToolSearchBar } from "@/components/home/tool-search-bar";
import { HeroFloatingIcons } from "@/components/home/hero-floating-icons";
import { FloatingPaths } from "@/components/ui/background-paths";
import { OrganicBlobs } from "@/components/illustrations/organic-blobs";

// This entrance was previously JS/Motion-driven: `initial="hidden"` on
// the wrapping motion.div meant Motion server-rendered the real headline,
// subhead, badge, and search bar at literal `opacity: 0` — invisible —
// and that stayed true until React hydrated on the client and Motion's
// `animate="show"` transition fired. Locally (`next start` on
// localhost), JS arrives in single-digit milliseconds, so that
// blank-hero window is imperceptible. Over a real network — the one
// thing that actually differs on Vercel vs local prod — hydration lands
// visibly later than first paint, especially on this page: the hero
// alone mounts two 18-path FloatingPaths instances plus OrganicBlobs and
// nine floating icons, all "use client" Motion components competing for
// the same hydration pass. The net effect was the site's single most
// important above-the-fold content (H1, subhead, search bar) rendering
// as blank, then popping in once hydration finally completed — read as
// "the page flickering" by anyone on a real connection.
// Fix: drive the entrance with a plain CSS @keyframes animation
// (`.hero-fade-up`, globals.css) instead of a Motion `initial`/`animate`
// pair. CSS animations run from the moment styles are parsed — no
// hydration dependency — so the SSR-painted frame already matches the
// animation's start state and content is guaranteed visible (fully
// opaque, at rest) within the animation's own short duration regardless
// of how long React takes to hydrate. `prefers-reduced-motion` in
// globals.css already zeroes out CSS animation durations sitewide, so
// this also gets reduced-motion support for free without the
// shouldReduceMotion branch the old Motion version needed.
export function HeroSection() {
  return (
    <section className="relative isolate z-20">
      {/* Animated metallic background lives on its own layer, separate
          from the text content below. metal-breathe animates `filter`,
          and animating filter on an element that also parents the real
          text/foreground content forces the browser to repaint that
          whole subtree every frame — on many GPU/driver combos this
          shows up as the entire section (gradient + text) flickering
          in and out rather than a smooth breathing glow. Isolating the
          gradient+filter animation to this empty absolutely-positioned
          div means only this decorative layer repaints; the text above
          it never does. */}
      <div
        className="pointer-events-none absolute inset-0 metallic-emerald-loud metallic-breathe"
        aria-hidden="true"
      />
      {/* Decorative background layer only — overflow-hidden lives here
          instead of on the section itself, so it clips the blobs/paths/
          floating icons but no longer clips the search dropdown below,
          which needs to be able to render past the hero's own bottom
          edge without getting cut off or visually detached from its
          input (see ToolSearchBar). */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <OrganicBlobs tone="on-accent" />
        <FloatingPaths
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
        />
      </div>
      <HeroFloatingIcons />
      <div className="relative mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-16 lg:py-28">
        <div className="text-center lg:text-left">
          <span
            className="hero-fade-up glass-panel inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-white"
            style={{ animationDelay: "0.05s" }}
          >
            <HiOutlineCheckCircle className="size-3.5" />
            70 tools, entirely free
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