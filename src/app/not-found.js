import Link from "next/link";
import { HiOutlineDocumentMagnifyingGlass, HiOutlineArrowUturnLeft } from "react-icons/hi2";

import { FileConversionPattern } from "@/components/illustrations/file-conversion-pattern";
import { ToolSearchBar } from "@/components/home/tool-search-bar";
import { Button } from "@/components/ui/button";
import { CATEGORIES, getTool } from "@/lib/registry/tools";

export const metadata = {
  title: "Page not found",
  description: "The page you're looking for doesn't exist or may have moved.",
  robots: { index: false, follow: true },
};

// A small, hand-picked set of well-known tools to surface as a recovery
// path — resolved through the registry (not hardcoded hrefs) so this
// list can never drift out of sync with the actual routes.
const POPULAR_SLUGS = [
  "merge-pdf",
  "compress-image",
  "pdf-to-word",
  "convert-video",
  "compress-pdf",
  "create-archive",
];

const popularTools = POPULAR_SLUGS.map((slug) => {
  const tool = getTool(slug);
  if (!tool) return null;
  const category = CATEGORIES[tool.category];
  return { ...tool, href: `/${category.slug}/${tool.slug}` };
}).filter(Boolean);

export default function NotFound() {
  return (
    <div className="relative isolate mx-auto max-w-[760px] px-4 py-20 sm:px-6 sm:py-28">
      <FileConversionPattern
        tone="on-white"
        className="pointer-events-none absolute inset-0 -z-10 size-full"
      />

      <div className="flex flex-col items-center text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-accent-tint text-accent">
          <HiOutlineDocumentMagnifyingGlass className="size-8" />
        </div>

        <p className="mt-6 font-display text-sm font-semibold tracking-widest text-accent-ink uppercase">
          404
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          We couldn&apos;t find that page
        </h1>
        <p className="mt-4 max-w-md text-base text-muted-foreground">
          The tool or page you&apos;re looking for doesn&apos;t exist, may have been renamed, or the
          link is out of date.
        </p>

        <ToolSearchBar className="mt-8" />

        <Button asChild variant="primary" size="lg" className="mt-6">
          <Link href="/">
            <HiOutlineArrowUturnLeft className="size-4" />
            Back to homepage
          </Link>
        </Button>
      </div>

      {popularTools.length > 0 && (
        <div className="mt-16 border-t border-border pt-10">
          <h2 className="text-center text-sm font-semibold text-foreground">Popular tools</h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {popularTools.map((tool) => (
              <Link
                key={tool.slug}
                href={tool.href}
                className="rounded-xl border border-border bg-card px-4 py-3 text-center text-sm font-medium text-foreground shadow-subtle transition-colors hover:border-accent hover:text-accent"
              >
                {tool.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
