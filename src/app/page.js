import Link from "next/link";
import { HiLockClosed, HiBolt, HiGlobeAlt, HiOutlineCheckCircle, HiArrowRight } from "react-icons/hi2";

import { ToolSearchBar } from "@/components/home/tool-search-bar";
import { ToolCard } from "@/components/home/tool-card";
import { HeroFloatingIcons } from "@/components/home/hero-floating-icons";
import { FloatingPaths } from "@/components/ui/background-paths";
import { SectionFlowLines } from "@/components/ui/section-flow-lines";
import { FileConversionPattern } from "@/components/illustrations/file-conversion-pattern";
import { CATEGORIES, getToolsByCategory, TOOLS } from "@/lib/registry/tools";
import { BLOG_POSTS } from "@/lib/registry/blog-content";
import { BlogPostCard } from "@/components/shared/blog-post-card";
import { getToolIcon } from "@/lib/registry/tool-icons";
import { Button } from "@/components/ui/button";

const POPULAR_SLUGS = [
  "merge-pdf",
  "compress-pdf",
  "pdf-to-word",
  "convert-image",
  "split-pdf",
  "word-to-pdf",
  "compress-image",
  "convert-video",
];

const TRUST_POINTS = [
  {
    icon: HiLockClosed,
    title: "Private by design",
    description: "Files are processed locally in your browser. Nothing is uploaded to a server.",
  },
  {
    icon: HiBolt,
    title: "Genuinely fast",
    description: "No upload wait, no queue. Processing starts the instant you drop a file.",
  },
  {
    icon: HiGlobeAlt,
    title: "Works everywhere",
    description: "No install, no account required. Runs in any modern browser, on any device.",
  },
];

export const metadata = {
  title: "Tools Root — Free Online File Converter & PDF Tools",
  description:
    "Merge, split, compress, and convert PDFs, images, documents, audio, and video — free, private, and no install required.",
  alternates: {
    canonical: "https://toolsroot.com/",
  },
};

export default function HomePage() {
  const popularTools = POPULAR_SLUGS.map((slug) => TOOLS.find((t) => t.slug === slug)).filter(Boolean);
  const latestGuides = [...BLOG_POSTS].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)).slice(0, 3);

  return (
    <div>
      {/* Hero — solid emerald-600, white text, animated white flow-lines
          behind everything (FloatingPaths ×2, recolored to white — same
          component/math as the light-background BackgroundPaths variant,
          see src/components/ui/background-paths.jsx), floating tool icons
          on top of that (desktop only; hidden on mobile so the animated
          layers never compete with the text for space). */}
      <section className="relative isolate overflow-hidden bg-accent">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <FloatingPaths position={1} colorRgb="255, 255, 255" />
          <FloatingPaths position={-1} colorRgb="255, 255, 255" />
        </div>
        <HeroFloatingIcons />
        <div className="relative mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-16 lg:py-28">
          <div className="text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
              <HiOutlineCheckCircle className="size-3.5" />
              70 tools, entirely free
            </span>
            <h1 className="font-display mx-auto mt-6 max-w-2xl text-4xl font-semibold tracking-tight text-balance text-white sm:text-6xl lg:mx-0">
              Every file tool you need, in one place
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-balance text-white/85 lg:mx-0">
              Merge, convert, compress, and edit PDFs, images, documents, audio, and video — free,
              private, and processed entirely in your browser.
            </p>
            <div className="mt-8 flex justify-center lg:justify-start">
              <ToolSearchBar />
            </div>
          </div>

          {/* Spacer column on large screens — the floating icons render as
              an absolutely-positioned overlay across the whole section, so
              this reserves the visual right-hand space for them without
              needing its own content. */}
          <div className="hidden lg:block" aria-hidden="true" />
        </div>
      </section>

      {/* Popular tools. SectionFlowLines emerald tone (this section has no
          bg-accent, so it needs the light-background variant, opposite of
          the hero/CTA's white lines). */}
      <section className="relative isolate z-10 overflow-hidden mx-auto max-w-[1280px] px-4 py-16 sm:px-6">
        <SectionFlowLines tone="on-light" />
        <div className="relative flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Most popular tools</h2>
        </div>
        <div className="relative mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {popularTools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </section>

      {/* Category navigation. SectionFlowLines emerald tone — this
          section's bg-secondary/30 tint is much closer to white than to
          the accent color, so it gets the same "on-light" emerald lines
          as the other plain-background sections. */}
      <section id="categories" className="relative isolate overflow-hidden border-y border-border bg-secondary/30">
        <SectionFlowLines tone="on-light" />
        <div className="relative mx-auto max-w-[1280px] px-4 py-16 sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Browse by category</h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(CATEGORIES).map(([key, cat]) => {
              const tools = getToolsByCategory(key);
              const FirstIcon = getToolIcon(tools[0]?.slug);
              return (
                <Link
                  key={key}
                  href={`/${cat.slug}`}
                  className="group flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-subtle transition-all hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-card"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-accent-tint text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                      <FirstIcon className="size-6" />
                    </div>
                    <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground">
                      {tools.length} tools
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{cat.label}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{cat.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* "How it works" banner — solid emerald-600 with a sparse abstract
          background illustration behind centered white text. This is the
          "background image, less content in it, text over it" section:
          the illustration is deliberately faint (4-14% opacity shapes) so
          it never competes with the copy on top of it. */}
      <section className="relative isolate overflow-hidden bg-accent">
        <FileConversionPattern className="pointer-events-none absolute inset-0 size-full" tone="on-accent" />
        <div className="relative mx-auto max-w-[720px] px-4 py-20 text-center sm:px-6">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            One tab, every format
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/85">
            No matter what you&apos;re converting from or to, it happens right here — no separate
            app for PDFs, another for images, and a third for video.
          </p>
        </div>
      </section>

      {/* Trust messaging — white background, bold emerald icon treatment.
          Full-bleed solid emerald is reserved for the hero, the banner
          above, and the closing CTA below; putting it here too would
          stack three green bands with nothing breaking them up.
          SectionFlowLines emerald tone, matching the other plain-bg
          sections. */}
      <section className="relative isolate overflow-hidden mx-auto max-w-[1280px] px-4 py-16 sm:px-6">
        <SectionFlowLines tone="on-light" />
        <div className="relative grid grid-cols-1 gap-8 sm:grid-cols-3">
          {TRUST_POINTS.map((point) => (
            <div key={point.title} className="flex flex-col items-start gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground shadow-accent-glow">
                <point.icon className="size-5" />
              </div>
              <h3 className="font-semibold text-foreground">{point.title}</h3>
              <p className="text-sm text-muted-foreground">{point.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Latest guides — same header/grid pattern as "Most popular tools"
          above, surfacing blog content from the homepage so it isn't only
          reachable via the footer link or direct search. Closes the
          homepage-doesn't-link-to-blog gap. */}
      <section className="relative isolate overflow-hidden border-y border-border bg-secondary/30 mx-auto max-w-none px-4 py-16 sm:px-6">
        <SectionFlowLines tone="on-light" />
        <div className="relative mx-auto flex max-w-[1280px] items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Latest guides</h2>
          <Link
            href="/blog"
            className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
          >
            View all
            <HiArrowRight className="size-3.5" />
          </Link>
        </div>
        <div className="relative mx-auto mt-6 grid max-w-[1280px] grid-cols-1 gap-4 sm:grid-cols-3">
          {latestGuides.map((post) => (
            <BlogPostCard key={post.slug} post={post} />
          ))}
        </div>
      </section>

      {/* CTA — full-bleed emerald-600 close, mirrors the hero treatment.
          SectionFlowLines white tone matches the hero's white-on-emerald
          choice; same "family" of animation, lighter density than the
          hero (see section-flow-lines.jsx for why: giving every section
          the hero's full density would be ~432 animated paths across the
          page, verified excessive). */}
      <section className="relative isolate overflow-hidden bg-accent">
        <SectionFlowLines tone="on-accent" />
        <div className="relative mx-auto max-w-[1280px] px-4 py-16 text-center sm:px-6">
          <h2 className="text-3xl font-semibold tracking-tight text-white">Ready to get started?</h2>
          <p className="mt-3 text-white/80">No signup required. Pick a tool and try it now.</p>
          <div className="mt-6">
            <Button asChild variant="on-accent" size="lg">
              <Link href="#categories">Browse all tools</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
