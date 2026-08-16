import { createElement } from "react";
import {
  HiOutlineDocumentText,
  HiOutlineArrowsRightLeft,
  HiOutlinePhoto,
  HiOutlineTableCells,
  HiOutlineFilm,
  HiOutlineMusicalNote,
  HiOutlineVideoCamera,
  HiOutlineSpeakerWave,
  HiOutlineArchiveBox,
} from "react-icons/hi2";

/**
 * One entry per category (all 9 — see CATEGORIES in
 * src/lib/registry/tools.js), sized/animated roughly by tool count (pdf:
 * 16, imageConverter: 12, document: 9, image: 8, video: 7, audioConverter:
 * 6, videoConverter: 5, audio: 4, archive: 2) so the busiest categories
 * read as the most prominent icons. Each icon gets its own float
 * amplitude/duration/rotation/delay so nine icons moving at once reads as
 * organic rather than one animation copy-pasted nine times.
 *
 * Positions are percentage-based, but — unlike a naive full-width
 * scatter — `left` is deliberately kept inside the ~66%-100% band that's
 * actually clear on desktop: the hero's grid is
 * `lg:grid-cols-[minmax(0,1fr)_420px]`, so the headline/paragraph column
 * occupies roughly the left 0%-61% and the reserved icon column is the
 * right ~420px of a ~1232px content area, i.e. ~66%-100%. Below `lg` the
 * columns stack (text above, icon area below) so horizontal placement
 * only matters at `lg`+, which is what this band is scoped to.
 *
 * No longer a client component. The float loop is a plain CSS animation
 * (.float-icon, globals.css) driven entirely by inline custom properties
 * (--float-y, --float-rotate, --float-duration, --float-delay) — each
 * icon needs its own amplitude/duration/delay, but that's just a CSS
 * custom property per element, not a reason to reach for Motion. That
 * drops this whole component (and its former "use client" boundary,
 * useReducedMotion() call, and nine live motion.div instances) out of
 * the client bundle and off the hydration path entirely; reduced-motion
 * support comes for free from the sitewide prefers-reduced-motion rule
 * in globals.css instead of a per-component branch.
 */
const FLOATING_ICONS = [
  { icon: HiOutlineDocumentText, top: "6%", left: "74%", size: "size-14 sm:size-20", duration: 6, distance: 18, rotate: 8, delay: 0 },
  { icon: HiOutlineArrowsRightLeft, top: "22%", left: "90%", size: "size-16 sm:size-24", duration: 7.5, distance: 22, rotate: -10, delay: 0.4 },
  { icon: HiOutlineTableCells, top: "34%", left: "70%", size: "size-12 sm:size-16", duration: 6.6, distance: 17, rotate: -7, delay: 1.3 },
  { icon: HiOutlinePhoto, top: "50%", left: "86%", size: "size-12 sm:size-16", duration: 5.5, distance: 15, rotate: 6, delay: 0.9 },
  { icon: HiOutlineFilm, top: "64%", left: "72%", size: "size-12 sm:size-14", duration: 6.2, distance: 16, rotate: 9, delay: 0.6 },
  { icon: HiOutlineMusicalNote, top: "74%", left: "92%", size: "size-10 sm:size-12", duration: 5.2, distance: 13, rotate: -6, delay: 1.7 },
  { icon: HiOutlineVideoCamera, top: "84%", left: "68%", size: "size-10 sm:size-12", duration: 6.9, distance: 14, rotate: 7, delay: 2.1 },
  { icon: HiOutlineSpeakerWave, top: "90%", left: "84%", size: "size-9 sm:size-11", duration: 5.8, distance: 12, rotate: -8, delay: 0.2 },
  { icon: HiOutlineArchiveBox, top: "40%", left: "96%", size: "size-9 sm:size-11", duration: 6.4, distance: 12, rotate: 6, delay: 1.1 },
];

export function HeroFloatingIcons() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 hidden overflow-hidden sm:block"
    >
      {FLOATING_ICONS.map((item, i) => (
        <div
          key={i}
          // Was `glass-panel` (backdrop-filter: blur+saturate). Nine of
          // these render here, and — even before the Motion→CSS move —
          // sitting on top of the hero's continuously-repainting
          // metal-breathe background made backdrop-filter close to
          // worst-case for compositor cost: nine elements resampling
          // live pixels beneath them, every frame, for as long as the
          // hero is on screen. `glass-panel-static` keeps the same
          // look — translucent white fill, inner highlight border, soft
          // shadow — via a plain background/border/box-shadow instead,
          // so there's nothing left to resample.
          className={`glass-panel-static float-icon absolute flex ${item.size} items-center justify-center rounded-3xl text-white`}
          style={{
            top: item.top,
            left: item.left,
            "--float-y": `-${item.distance}px`,
            "--float-rotate": `${item.rotate}deg`,
            "--float-duration": `${item.duration}s`,
            "--float-delay": `${item.delay}s`,
          }}
        >
          {createElement(item.icon, { className: "size-1/2" })}
        </div>
      ))}
    </div>
  );
}
