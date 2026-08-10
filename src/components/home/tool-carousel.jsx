"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";

import { ToolCard } from "@/components/home/tool-card";
import { cn } from "@/lib/utils";

/**
 * Horizontal scroll-snap carousel for the "Most popular tools" section.
 * Wraps ToolCard (unmodified — see that file; it's shared with category
 * pages and tool-page "Related tools") in a fixed-width slide, rather
 * than letting it stretch to a grid cell, which is the only per-instance
 * sizing ToolCard's own `className` prop needs to support here.
 *
 * Deliberately scroll-snap + native drag/touch/wheel, not a JS-timer
 * autoplay carousel: nothing moves unless the person moves it. A
 * self-cycling carousel above the fold would be exactly the kind of
 * "motion nobody asked for, competing for attention" the motion skill's
 * golden rule warns about — this one only reveals what's already static
 * content in a different arrangement, the same content the old 4-col
 * grid showed, just browsable a few at a time instead of all-eight-at-
 * once. Prev/next buttons are still provided for people who don't want
 * to click-drag/scroll, and for keyboard users tabbing through the page
 * (they're real <button>s, not a div-with-onClick).
 */
export function ToolCarousel({ tools }) {
  const trackRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateArrowState = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    // 2px tolerance: scrollWidth/scrollLeft can be off by a sub-pixel
    // amount depending on browser zoom/DPI, which would otherwise leave
    // the "next" arrow visually disabled one pixel before the real end.
    setCanScrollLeft(track.scrollLeft > 2);
    setCanScrollRight(track.scrollLeft < track.scrollWidth - track.clientWidth - 2);
  }, []);

  useEffect(() => {
    updateArrowState();
    const track = trackRef.current;
    if (!track) return;
    // Also re-check on resize: how many cards fit changes the scrollable
    // range, which can flip a disabled arrow back to enabled (or vice
    // versa) without any scroll event firing.
    const resizeObserver = new ResizeObserver(updateArrowState);
    resizeObserver.observe(track);
    return () => resizeObserver.disconnect();
  }, [updateArrowState]);

  const scrollByCard = (direction) => {
    const track = trackRef.current;
    if (!track) return;
    // Scroll by roughly one card's width (first child's real rendered
    // width, not a hardcoded guess) so each click/tap moves a
    // consistent, predictable amount regardless of viewport size.
    const cardWidth = track.firstElementChild?.getBoundingClientRect().width ?? 280;
    track.scrollBy({ left: direction * (cardWidth + 16), behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div
        ref={trackRef}
        onScroll={updateArrowState}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {tools.map((tool) => (
          <div key={tool.slug} className="w-[260px] flex-shrink-0 snap-start sm:w-[280px]">
            <ToolCard tool={tool} className="h-full" />
          </div>
        ))}
      </div>
      {/* Edge fades hint that more cards sit off-screen — a lighter-touch
          signal than the arrows alone, and matches (soft, low-opacity
          gradient) rather than fighting the site's existing restrained
          visual language. Purely decorative, so aria-hidden. */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-background to-transparent sm:w-12"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent sm:w-12"
        aria-hidden="true"
      />
      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => scrollByCard(-1)}
          disabled={!canScrollLeft}
          aria-label="Scroll to previous tools"
          className={cn(
            "flex size-9 items-center justify-center rounded-full border border-border/70 bg-card text-foreground transition-[opacity,border-color] duration-150 ease-[var(--ease-standard)] hover:border-accent/40 disabled:pointer-events-none disabled:opacity-40"
          )}
        >
          <HiChevronLeft className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => scrollByCard(1)}
          disabled={!canScrollRight}
          aria-label="Scroll to more tools"
          className={cn(
            "flex size-9 items-center justify-center rounded-full border border-border/70 bg-card text-foreground transition-[opacity,border-color] duration-150 ease-[var(--ease-standard)] hover:border-accent/40 disabled:pointer-events-none disabled:opacity-40"
          )}
        >
          <HiChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
