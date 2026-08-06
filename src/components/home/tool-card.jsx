import Link from "next/link";
import { HiArrowRight } from "react-icons/hi2";
import { createElement } from "react";

import { getToolIcon } from "@/lib/registry/tool-icons";
import { CATEGORIES } from "@/lib/registry/tools";
import { cn } from "@/lib/utils";

export function ToolCard({ tool, className }) {
  const category = CATEGORIES[tool.category];

  return (
    <Link
      href={`/${category.slug}/${tool.slug}`}
      className={cn(
        // glossy-card + glossy-card-hover (globals.css, v4): tinted
        // ambient shadow at rest, escalating to a deeper emerald-tinted
        // shadow on hover, replacing the old flat shadow-subtle ->
        // shadow-card swap. transition-all still avoided (explicit
        // properties only) per the Vercel Web Interface Guidelines —
        // this is a frequent, repeated-many-times-per-page element (tool
        // grids on the homepage, every category page, every tool page's
        // "related tools"), so the hover interaction itself stays the
        // same quick, subtle lift as before; only the material changed.
        "glossy-card glossy-card-hover group flex flex-col gap-3 rounded-2xl border border-border/70 bg-card p-5 transition-[transform,border-color] duration-150 ease-[var(--ease-standard)] hover:-translate-y-1 hover:border-accent/30",
        className
      )}
    >
      <div className="flex items-center justify-between">
        {/* Metallic icon chip (was a flat bg-accent-tint square) — same
            emerald gradient recipe as the hero surfaces, at chip scale,
            so tool icons read as small pieces of the same brushed-metal
            material rather than a separate flat-tint language. */}
        <div className="metallic-emerald flex size-11 items-center justify-center rounded-xl text-white shadow-[0_2px_8px_-2px_rgba(5,150,105,0.4)] transition-[transform,box-shadow] duration-150 ease-[var(--ease-standard)] group-hover:scale-105 group-hover:shadow-accent-glow">
          {createElement(getToolIcon(tool.slug), { className: "size-5" })}
        </div>
        <HiArrowRight className="size-4 text-muted-foreground opacity-0 transition-[transform,opacity] duration-150 ease-[var(--ease-standard)] group-hover:translate-x-0.5 group-hover:opacity-100" />
      </div>
      <div>
        <h3 className="font-semibold text-foreground">{tool.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{tool.description}</p>
      </div>
    </Link>
  );
}
