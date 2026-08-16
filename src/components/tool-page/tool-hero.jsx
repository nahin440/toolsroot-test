import { createElement } from "react";
import { HiOutlineLockClosed } from "react-icons/hi2";

import { getToolIcon } from "@/lib/registry/tool-icons";
import { HeroIconFloat } from "@/components/shared/hero-icon-float";
import { FloatingPaths } from "@/components/ui/background-paths";
import { OrganicBlobs } from "@/components/illustrations/organic-blobs";

/**
 * Full-bleed metallic-emerald hero for a tool page — the same v3 design
 * system as the homepage hero (metallic-emerald-soft gradient mesh + slow
 * ambient breathe instead of the old flat --accent fill, white text,
 * animated white flow-lines behind everything, floating icon on the
 * right, hidden on mobile) but with a single icon specific to this tool
 * instead of five category icons — this is the "dynamic logo per tool"
 * piece, and now the surface every one of the 70 tool pages shares.
 *
 * FloatingPaths is the same component/density (2 instances, white, 36
 * paths each) the homepage hero uses — deliberately the heavier "hero
 * scale" treatment, not the lighter SectionFlowLines used on the
 * homepage's smaller sections (Popular tools, Categories, etc.), since
 * this section is a full hero in its own right on every tool page, not a
 * supporting section sharing a page with several others. Each tool page
 * only renders its own hero, so reusing the homepage hero's density here
 * doesn't compound the way it would if every homepage section used it.
 *
 * OrganicBlobs (Ditto-referenced soft drifting shapes) sits between the
 * metal gradient and FloatingPaths, same layering as the homepage hero —
 * another Client Component rendered as a child, same pattern already
 * established by FloatingPaths/HeroIconFloat below, so the Server/Client
 * boundary this file documents doesn't change.
 *
 * This is a Server Component: getToolIcon is resolved here, and only the
 * resulting <Icon /> element is handed to the client-only HeroIconFloat
 * wrapper for animation. Resolving here (rather than inside a client
 * component) means this route's client bundle never has to include the
 * full 36-icon tool-icons registry — only the one icon this page actually
 * uses ends up server-rendered into the HTML. FloatingPaths is also a
 * client component ("use client"), but a Server Component can render a
 * Client Component as a child without itself becoming one — same pattern
 * already used here for HeroIconFloat, so this doesn't change that. This
 * redesign pass swapped the background utility to the louder
 * metallic-emerald-loud variant (more visual presence than the original
 * metallic-emerald-soft, per the redesign brief) and added the organic
 * blob layer; no logic moved, so the Server/Client boundary is exactly
 * what it was before.
 *
 * The H1 and description text are unchanged from the original plain
 * layout — same tag, same copy, same DOM order relative to the rest of
 * the page — only the surrounding container/background changed, so the
 * SEO metadata and JSON-LD built around this content stay accurate.
 */
export function ToolHero({ tool }) {
  const ToolIcon = getToolIcon(tool.slug);

  return (
    <section className="relative isolate overflow-hidden rounded-3xl">
      {/* Animated background isolated to its own layer — metal-breathe
          animates `filter`, and animating filter on an element that
          also parents the real text content forces the browser to
          repaint that whole subtree every frame, which shows up as the
          entire section (gradient + text) flickering rather than a
          smooth breathing glow. Keeping it on this empty absolutely-
          positioned div means only this decorative layer repaints. */}
      <div
        className="pointer-events-none absolute inset-0 rounded-3xl metallic-emerald-loud metallic-breathe"
        aria-hidden="true"
      />
      <OrganicBlobs tone="on-accent" />
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <FloatingPaths position={1} colorRgb="255, 255, 255" />
        <FloatingPaths position={-1} colorRgb="255, 255, 255" />
      </div>
      <HeroIconFloat>{createElement(ToolIcon, { className: "size-1/2" })}</HeroIconFloat>

      <div className="relative px-6 py-10 sm:px-10 sm:py-14 lg:max-w-[65%] lg:py-16">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          {tool.name}
        </h1>
        <p className="mt-2 max-w-2xl text-lg text-white/85">{tool.description}</p>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-white/75">
          <HiOutlineLockClosed className="size-3.5" />
          Processed entirely in your browser. Your file is never uploaded anywhere.
        </p>
      </div>
    </section>
  );
}
