import Link from "next/link";
import { HiShieldCheck } from "react-icons/hi2";

import { LogoMark } from "./logo";
import { SocialLinks } from "@/components/shared/social-links";
import { CATEGORIES, getToolsByCategory } from "@/lib/registry/tools";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary/30">
      <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6">
          {Object.entries(CATEGORIES).map(([key, cat]) => {
            const tools = getToolsByCategory(key).slice(0, 6);
            return (
              <div key={key}>
                <h3 className="text-sm font-semibold text-foreground">{cat.label}</h3>
                <ul className="mt-3 space-y-2">
                  {tools.map((tool) => (
                    <li key={tool.slug}>
                      <Link
                        href={`/${cat.slug}/${tool.slug}`}
                        className="text-sm text-muted-foreground transition-colors hover:text-accent"
                      >
                        {tool.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-6 border-t border-border pt-8 sm:flex-row sm:items-center">
          <div>
            <LogoMark />
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Every conversion runs in your browser. Your files are never uploaded to a server.
            </p>
            <SocialLinks className="mt-4" />
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <Link href="/about" className="hover:text-accent">About</Link>
            <Link href="/blog" className="hover:text-accent">Blog</Link>
            <Link href="/pricing" className="hover:text-accent">Pricing</Link>
            <Link href="/privacy" className="hover:text-accent">Privacy</Link>
            <Link href="/terms" className="hover:text-accent">Terms</Link>
            <Link href="/contact" className="hover:text-accent">Contact</Link>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <HiShieldCheck className="size-4 shrink-0 text-accent" />
            All processing happens locally in your browser
          </p>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} Tools Root. All rights reserved. Developed by Zero Degree Corp.</p>
            <span className="hidden text-border sm:inline" aria-hidden="true">•</span>
            <span className="rounded-full bg-secondary px-2 py-0.5 font-mono text-[11px] font-medium text-muted-foreground">
              v2.0.1
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
