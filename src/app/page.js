import Link from "next/link";
import Image from "next/image";
import { createElement } from "react";
import { HiLockClosed, HiBolt, HiGlobeAlt, HiArrowRight } from "react-icons/hi2";

import { ToolCarousel } from "@/components/home/tool-carousel";
import { CategoryBento } from "@/components/home/category-bento";
import { HeroSection } from "@/components/home/hero-section";
import { TrustPoints } from "@/components/home/trust-points";
import { SectionFlowLines } from "@/components/ui/section-flow-lines";
import { FileConversionPattern } from "@/components/illustrations/file-conversion-pattern";
import { CATEGORIES, getToolsByCategory, TOOLS } from "@/lib/registry/tools";
import { BLOG_POSTS } from "@/lib/registry/blog-content";
import { FeaturedGuides } from "@/components/home/featured-guides";
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
    icon: <HiLockClosed className="size-5" />,
    title: "Private by design",
    description: "Files are processed locally in your browser. Nothing is uploaded to a server.",
  },
  {
    icon: <HiBolt className="size-5" />,
    title: "Genuinely fast",
    description: "No upload wait, no queue. Processing starts the instant you drop a file.",
  },
  {
    icon: <HiGlobeAlt className="size-5" />,
    title: "Works everywhere",
    description: "No install, no account required. Runs in any modern browser, on any device.",
  },
];

export const metadata = {
  title: "Tools Root: Free Online File Converter, PDF Editor & Image Compressor",
  description:
    "Free online file converter and PDF editor with 115+ tools: merge PDF, compress PDF, convert PDF to Word, convert JPG to PNG or WEBP, compress images, convert MP4 and MP3, and more. Private, no signup, no install, no watermark.",
  keywords: [
    "free online file converter",
    "pdf converter online free",
    "merge pdf online free",
    "compress pdf online",
    "pdf to word converter",
    "word to pdf converter",
    "jpg to png converter",
    "png to jpg converter",
    "heic to jpg converter",
    "image compressor online",
    "convert mp4 to mp3 free",
    "video converter online free",
    "compress video online",
    "zip file converter",
    "online file converter no signup",
    "split pdf online free",
    "rotate pdf online",
    "watermark pdf online",
    "password protect pdf online",
    "ocr pdf online free",
    "sign pdf online free",
    "excel to pdf converter",
    "powerpoint to pdf converter",
    "pdf to excel converter",
    "remove background from image online",
    "resize image online free",
    "webp to jpg converter",
    "convert avi to mp4",
    "extract audio from video online",
    "unlock pdf online",
    "browser based file converter",
    "no upload file converter",
    "private online file converter",
  ],
  alternates: {
    canonical: "https://toolsroot.com/",
  },
  openGraph: {
    title: "Tools Root: Free Online File Converter, PDF Editor & Image Compressor",
    description:
      "70 free tools to merge, split, compress, and convert PDFs, images, documents, audio, and video. Private, fast, and processed entirely in your browser.",
    url: "https://toolsroot.com/",
  },
};

export default function HomePage() {
  const popularTools = POPULAR_SLUGS.map((slug) => TOOLS.find((t) => t.slug === slug)).filter(Boolean);
  const latestGuides = [...BLOG_POSTS].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)).slice(0, 3);
  const categoryBentoItems = Object.entries(CATEGORIES)
    .map(([key, category]) => {
      const tools = getToolsByCategory(key);
      const Icon = getToolIcon(tools[0]?.slug);
      return {
        category,
        tools,
        // Pre-rendered element, not the bare component reference — see
        // this same pattern's rationale in trust-points.jsx; CategoryBento
        // is a Client Component and React can't serialize a function
        // reference across that boundary. size-full (not a fixed size)
        // so the icon scales with whichever circle it's placed inside —
        // CategoryBento uses a bigger circle for the hero cell than for
        // the 8 regular cells, and a hardcoded size wouldn't adapt.
        iconElement: createElement(Icon, { className: "size-full" }),
      };
    })
    // Real tool count drives which category gets the hero cell, not
    // object-key declaration order in CATEGORIES (which is incidental
    // and would silently break this if that registry ever gets reordered).
    .sort((a, b) => b.tools.length - a.tools.length);

  return (
    <div>
      {/* Hero — metallic-emerald-soft gradient mesh (v3 design system,
          see globals.css) instead of the old flat bg-accent, with a slow
          10s ambient "breathe" drift (metallic-breathe) so the surface
          reads as catching light rather than a static fill. White text,
          animated white flow-lines behind everything (FloatingPaths ×2,
          recolored to white, reduced-motion-safe via useReducedMotion —
          see src/components/ui/background-paths.jsx), floating tool
          icons on top of that (desktop only; hidden on mobile so the
          animated layers never compete with the text for space). The
          eyebrow badge gets the glass-panel treatment (frosted, layered
          border, inner highlight) since it's small chrome sitting on
          the metal, not the metal
          itself. Entrance is one orchestrated stagger (badge → heading →
          subtext → search), motivated by hierarchy: it tells the eye
          where to look first on load, once, not on every scroll. */}
      <HeroSection />

      {/* Popular tools. SectionFlowLines emerald tone (this section has no
          bg-accent, so it needs the light-background variant, opposite of
          the hero/CTA's white lines). Heading now Roboto Slab (font-display,
          picks up the sitewide serif automatically) for the same
          editorial-serif treatment as every other section heading. */}
      <section className="relative isolate z-10 overflow-hidden mx-auto max-w-[1280px] px-4 py-16 sm:px-6">
        <SectionFlowLines tone="on-light" />
        <div className="relative flex items-end justify-between">
          <div>
            <span className="text-xs font-semibold tracking-[0.14em] text-accent uppercase">
              Start here
            </span>
            <h2 className="font-display mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Most popular tools
            </h2>
          </div>
        </div>
        <div className="relative mt-6">
          <ToolCarousel tools={popularTools} />
        </div>
      </section>

      {/* Photography band — breaks the grid/grid/grid rhythm (Popular
          Tools above, Browse by Category below are both card grids;
          repeating that shape a third time in a row is the exact
          "every section looks the same" pattern the redesign brief
          calls out). Two real photographs (Unsplash, verified via the
          same allow-listed CDN path already used for blog images, see
          next.config.mjs) presented as offset floating-artifact cards
          — the Steep reference's "white card + soft wide shadow"
          language (--shadow-float, globals.css) rather than a full-
          bleed hero image, so it reads as a considered composition
          fragment, not a stock-photo banner. Purely atmospheric: no
          tool, category, or copy lives in this section, so nothing
          here is content that needs preserving/updating. */}
      <section className="relative isolate overflow-hidden mx-auto max-w-[1280px] px-4 py-4 sm:px-6">
        <div className="relative grid grid-cols-1 items-center gap-10 sm:grid-cols-2 sm:gap-14">
          <div className="relative h-[280px] sm:h-[340px]">
            <div className="absolute top-0 left-0 h-[220px] w-[78%] overflow-hidden rounded-2xl bg-secondary shadow-float sm:h-[260px]">
              <Image
                src="https://images.unsplash.com/photo-1752223638233-4c9545333f89?w=900&q=80&auto=format&fit=crop"
                alt="A tidy desk with a laptop, set up for focused work"
                fill
                sizes="(max-width: 640px) 78vw, 380px"
                className="object-cover"
                // This is the larger of the two photography-band images and
                // sits inside the homepage's first viewport on most common
                // screen sizes (right below the hero, which has no image of
                // its own — just gradient/SVG/text) — making it the likely
                // Largest Contentful Paint element. Without `priority`,
                // next/image defaults every image to loading="lazy", which
                // on some browsers means the request doesn't even start
                // until layout confirms the image is near-viewport, adding
                // avoidable delay to LCP for content that's actually visible
                // on load. `priority` switches this one to eager-loaded and
                // preloaded, which is exactly what next/image's own docs
                // recommend for a page's LCP candidate.
                priority
              />
            </div>
            <div className="absolute right-0 bottom-0 h-[160px] w-[62%] overflow-hidden rounded-2xl bg-secondary shadow-float ring-4 ring-background sm:h-[190px]">
              <Image
                src="https://images.unsplash.com/photo-1679153369902-50687ca31379?w=700&q=80&auto=format&fit=crop"
                alt="Warm afternoon light over a plant beside a workspace window"
                fill
                sizes="(max-width: 640px) 62vw, 300px"
                className="object-cover"
                // Smaller, secondary image in the same pair — left on the
                // default lazy behavior deliberately, so the one real
                // priority signal on this page points unambiguously at the
                // actual LCP candidate above rather than being split
                // between two images (next/image and Chrome's own LCP
                // heuristics both work better with a single clear signal
                // per page than several competing `priority` images).
              />
            </div>
          </div>
          <div>
            <span className="text-xs font-semibold tracking-[0.14em] text-accent uppercase">
              Built for real work
            </span>
            <h2 className="font-display mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Wherever the work happens, the tools are already there
            </h2>
            <p className="mt-3 max-w-md text-muted-foreground">
              No install, no upload wait, no account. Open a tool, drop a file, and it&apos;s done
              before you&apos;d have finished signing up somewhere else.
            </p>
          </div>
        </div>
      </section>

      {/* Category navigation. SectionFlowLines emerald tone — this
          section's bg-secondary/30 tint is much closer to white than to
          the accent color, so it gets the same "on-light" emerald lines
          as the other plain-background sections. Cards now glossy-card
          (v4) with metallic icon chips, matching ToolCard's upgrade
          above — the whole site's "clickable tool/category tile" now
          reads as one consistent coated material. */}
      <section id="categories" className="relative isolate overflow-hidden border-y border-border bg-secondary/30">
        <SectionFlowLines tone="on-light" />
        <div className="relative mx-auto max-w-[1280px] px-4 py-16 sm:px-6">
          <span className="text-xs font-semibold tracking-[0.14em] text-accent uppercase">Browse</span>
          <h2 className="font-display mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Browse by category
          </h2>
          <div className="mt-6">
            <CategoryBento items={categoryBentoItems} />
          </div>
        </div>
      </section>

      {/* "How it works" banner — metallic-emerald-soft with ambient breathe
          (v3 design system) instead of the old flat bg-accent, with the
          same sparse abstract FileConversionPattern illustration on top.
          The illustration's shapes stay flat-fill at 4-14% opacity per its
          own documented design constraint (see file-conversion-pattern.jsx)
          — only the section's own background changed here, so the
          illustration still reads as fine linework texture over the metal
          rather than competing with it. */}
      <section className="relative isolate overflow-hidden">
        {/* Animated background isolated to its own layer — see
            hero-section.jsx for why metal-breathe (background-position
            only, no `filter`) must never sit on the same element as the
            text content, or the whole section flickers as the browser
            repaints the entire subtree every animation frame. */}
        <div
          className="pointer-events-none absolute inset-0 metallic-emerald-soft metallic-breathe"
          aria-hidden="true"
        />
        {/* Opacity-only brightness pulse, layered on top of the div above
            instead of inside it — see .metallic-breathe-glow in
            globals.css for why this replaced a `filter` animation on the
            layer itself. */}
        <div
          className="pointer-events-none absolute inset-0 metallic-breathe-glow"
          aria-hidden="true"
        />
        <FileConversionPattern className="pointer-events-none absolute inset-0 size-full" tone="on-accent" />
        <div className="relative mx-auto max-w-[720px] px-4 py-20 text-center sm:px-6">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            One tab, every format
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/85">
            No matter what you&apos;re converting from or to, it happens right here. No separate
            app for PDFs, another for images, and a third for video.
          </p>
        </div>
      </section>

      {/* Trust messaging — white background, bold emerald icon treatment
          (now metallic-emerald, matching the v3 system). Full-bleed
          solid/metallic emerald is reserved for the hero, the banner
          above, and the closing CTA below; putting it here too would
          stack three green bands with nothing breaking them up.
          SectionFlowLines emerald tone, matching the other plain-bg
          sections. TrustPoints (client leaf) adds a once-only
          scroll-triggered stagger reveal without making this whole
          Server Component page a client component. */}
      <section className="relative isolate overflow-hidden mx-auto max-w-[1280px] px-4 py-16 sm:px-6">
        <SectionFlowLines tone="on-light" />
        <TrustPoints points={TRUST_POINTS} />
      </section>

      {/* Latest guides — replaced the plain 3-up BlogPostCard grid with an
          editorial "featured story + supporting stories" layout
          (FeaturedGuides) so this section reads as considered rather than
          a repeated card shape. BlogPostCard itself is untouched — it's
          still what renders on /blog, category pages, and tool-page
          "Related articles". */}
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
        <div className="relative mx-auto mt-6 max-w-[1280px]">
          <FeaturedGuides posts={latestGuides} />
        </div>
      </section>

      {/* Long-form SEO content — keyword-rich copy covering every tool
          category, written for search engines and for visitors deciding
          whether this is the right site, not just for crawlability.
          Same prose classes as the About page (text-sm leading-relaxed
          text-muted-foreground) for visual consistency site-wide. Links
          out to every category page, several popular tools, and a couple
          of guides, so this section also does real internal-linking work
          rather than sitting as isolated filler text. */}
      <section className="relative isolate overflow-hidden mx-auto max-w-[1280px] px-4 py-16 sm:px-6">
        <SectionFlowLines tone="on-light" />
        <div className="relative mx-auto max-w-3xl">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground">
            A free online file converter and PDF editor for every format
          </h2>
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              Tools Root is a free online file converter, PDF editor, image compressor, and
              document conversion platform built around one idea: every everyday file task,
              converting, compressing, merging, or editing, should be fast, free, and private,
              without installing desktop software or creating an account. Whether you need a{" "}
              <Link href="/pdf-tools/merge-pdf" className="font-medium text-accent hover:underline">
                PDF merger
              </Link>
              , a{" "}
              <Link href="/pdf-tools/compress-pdf" className="font-medium text-accent hover:underline">
                PDF compressor
              </Link>
              , a{" "}
              <Link href="/image-converter" className="font-medium text-accent hover:underline">
                JPG to PNG converter
              </Link>
              , or an{" "}
              <Link href="/video-tools" className="font-medium text-accent hover:underline">
                MP4 video compressor
              </Link>
              , this free online tool works the same way in every browser, on Windows, Mac,
              Linux, Android, or iPhone. No install, no signup, no watermark, and no per-file
              paywall.
            </p>
            <p>
              What sets this file converter apart from most free online conversion websites is
              where the actual conversion happens. Every one of the 115+ tools listed on this site,
              PDF tools, image tools, an image format converter, document converters, audio tools,
              an audio format converter, video tools, a video format converter, and archive tools,
              runs entirely inside your own browser tab using JavaScript and WebAssembly. Your PDF,
              photo, Word document, MP3, or video file is read, processed, and written back out
              locally on your own device. It is never uploaded to a remote server, which is exactly
              why this online file converter is both genuinely private and noticeably faster than
              upload-then-download alternatives: there is no upload wait, no server queue, and no
              file sitting on someone else&apos;s storage after you close the tab.
            </p>
            <h2 className="!mt-8 font-display text-2xl font-semibold tracking-tight text-foreground">
              Free PDF tools: merge, compress, split, and convert PDF online
            </h2>
            <p>
              The <Link href="/pdf-tools" className="font-medium text-accent hover:underline">PDF tools</Link>{" "}
              collection covers the full range of everyday PDF work: a free{" "}
              <Link href="/pdf-tools/merge-pdf" className="font-medium text-accent hover:underline">
                PDF merger
              </Link>{" "}
              to combine multiple PDF files into one document, a{" "}
              <Link href="/pdf-tools/split-pdf" className="font-medium text-accent hover:underline">
                PDF splitter
              </Link>{" "}
              to pull pages out into their own file, a{" "}
              <Link href="/pdf-tools/compress-pdf" className="font-medium text-accent hover:underline">
                PDF compressor
              </Link>{" "}
              to shrink an oversized PDF for email, and dedicated tools to{" "}
              <Link href="/pdf-tools/rotate-pdf" className="font-medium text-accent hover:underline">
                rotate PDF pages
              </Link>
              ,{" "}
              <Link href="/pdf-tools/watermark-pdf" className="font-medium text-accent hover:underline">
                add a PDF watermark
              </Link>
              ,{" "}
              <Link href="/pdf-tools/password-protect-pdf" className="font-medium text-accent hover:underline">
                password protect a PDF
              </Link>
              , or run{" "}
              <Link href="/pdf-tools/ocr-pdf" className="font-medium text-accent hover:underline">
                OCR on a scanned PDF
              </Link>{" "}
              to make it searchable. Need to move between PDF and Office formats? The{" "}
              <Link href="/document-tools" className="font-medium text-accent hover:underline">
                document tools
              </Link>{" "}
              category has a free{" "}
              <Link href="/document-tools/word-to-pdf" className="font-medium text-accent hover:underline">
                Word to PDF converter
              </Link>
              , a{" "}
              <Link href="/document-tools/pdf-to-word" className="font-medium text-accent hover:underline">
                PDF to Word converter
              </Link>
              , plus Excel and PowerPoint conversions in both directions.
            </p>
            <h2 className="!mt-8 font-display text-2xl font-semibold tracking-tight text-foreground">
              Image converter and photo editing tools: JPG, PNG, WEBP, HEIC, and more
            </h2>
            <p>
              The{" "}
              <Link href="/image-converter" className="font-medium text-accent hover:underline">
                image converter
              </Link>{" "}
              handles every common image format pair: a{" "}
              <Link href="/image-converter/jpg-to-png" className="font-medium text-accent hover:underline">
                JPG to PNG converter
              </Link>
              , a{" "}
              <Link href="/image-converter/png-to-jpg" className="font-medium text-accent hover:underline">
                PNG to JPG converter
              </Link>
              , a{" "}
              <Link href="/image-converter/heic-to-jpg" className="font-medium text-accent hover:underline">
                HEIC to JPG converter
              </Link>{" "}
              for iPhone photos, and WEBP, AVIF, GIF, BMP, TIFF, and SVG conversions, alongside an
              all-in-one converter for any format combination. Once a photo is in the right format,
              the{" "}
              <Link href="/image-tools" className="font-medium text-accent hover:underline">
                image tools
              </Link>{" "}
              category picks up from there with an{" "}
              <Link href="/image-tools/compress-image" className="font-medium text-accent hover:underline">
                image compressor
              </Link>{" "}
              to shrink file size,{" "}
              <Link href="/image-tools/resize-image" className="font-medium text-accent hover:underline">
                image resizing
              </Link>
              ,{" "}
              <Link href="/image-tools/crop-image" className="font-medium text-accent hover:underline">
                image cropping
              </Link>
              , a{" "}
              <Link href="/image-tools/remove-background" className="font-medium text-accent hover:underline">
                background remover
              </Link>{" "}
              built on a genuine machine-learning segmentation model, and image watermarking and
              metadata inspection tools.
            </p>
            <h2 className="!mt-8 font-display text-2xl font-semibold tracking-tight text-foreground">
              Audio and video converters: compress, trim, and convert MP4, MP3, and more
            </h2>
            <p>
              For audio and video, the same locally-run engine (a real FFmpeg build compiled to
              WebAssembly) powers a{" "}
              <Link href="/video-tools/compress-video" className="font-medium text-accent hover:underline">
                video compressor
              </Link>
              , a{" "}
              <Link href="/video-converter" className="font-medium text-accent hover:underline">
                video format converter
              </Link>{" "}
              covering MP4, MOV, AVI, MKV, and animated GIF, plus{" "}
              <Link href="/video-tools/trim-video" className="font-medium text-accent hover:underline">
                video trimming
              </Link>
              ,{" "}
              <Link href="/video-tools/resize-video" className="font-medium text-accent hover:underline">
                video resizing
              </Link>
              , and video watermarking. The{" "}
              <Link href="/audio-converter" className="font-medium text-accent hover:underline">
                audio converter
              </Link>{" "}
              covers every common pairing, including an{" "}
              <Link href="/audio-converter/mp4-to-mp3" className="font-medium text-accent hover:underline">
                MP4 to MP3 converter
              </Link>{" "}
              for pulling audio out of a video file, alongside{" "}
              <Link href="/audio-tools/trim-audio" className="font-medium text-accent hover:underline">
                audio trimming
              </Link>
              ,{" "}
              <Link href="/audio-tools/merge-audio" className="font-medium text-accent hover:underline">
                merging
              </Link>
              , and{" "}
              <Link href="/audio-tools/normalize-audio" className="font-medium text-accent hover:underline">
                loudness normalization
              </Link>{" "}
              in the{" "}
              <Link href="/audio-tools" className="font-medium text-accent hover:underline">
                audio tools
              </Link>{" "}
              category. Rounding things out, the{" "}
              <Link href="/archive-tools" className="font-medium text-accent hover:underline">
                archive tools
              </Link>{" "}
              category creates and extracts ZIP, 7Z, TAR, and GZ archives, and can extract RAR
              files as well.
            </p>
            <h2 className="!mt-8 font-display text-2xl font-semibold tracking-tight text-foreground">
              Why choose a browser-based file converter over desktop software
            </h2>
            <p>
              Traditional file conversion means picking one of two flawed options: install a
              separate desktop app for every format you work with, or upload your file to an
              unfamiliar website and hope it&apos;s deleted afterward. A browser-based converter
              that genuinely processes files on-device solves both problems at once: there&apos;s
              nothing to install, nothing to update, and no file ever leaves your computer to be
              converted somewhere else. That also means these tools keep working offline once a
              page has loaded, and scale to as many files or as large a batch as your own
              device&apos;s memory allows, rather than a shared server&apos;s usage quota. For a
              closer look at picking the
              right tool for a specific job, the{" "}
              <Link href="/blog/jpg-vs-png-vs-webp" className="font-medium text-accent hover:underline">
                JPG vs PNG vs WEBP guide
              </Link>{" "}
              and{" "}
              <Link href="/blog/how-to-reduce-pdf-file-size" className="font-medium text-accent hover:underline">
                PDF file size guide
              </Link>{" "}
              on the{" "}
              <Link href="/blog" className="font-medium text-accent hover:underline">
                blog
              </Link>{" "}
              cover two of the most common format and compression questions in more detail.
            </p>
            <h2 className="!mt-8 font-display text-2xl font-semibold tracking-tight text-foreground">
              Handling large files without an upload limit slowing you down
            </h2>
            <p>
              Because every conversion, compression, and edit happens inside your own browser tab
              rather than on a remote server, this file converter is not bound by the strict
              upload caps that many free online tools enforce to manage server load and bandwidth
              costs. A large video file, a high-resolution photo batch, or a lengthy scanned PDF
              can be processed the same way a small file is, since the only real constraint is
              your own device&apos;s available memory rather than a fixed server-side ceiling. The{" "}
              <Link href="/video-tools/compress-video" className="font-medium text-accent hover:underline">
                video compressor
              </Link>{" "}
              and{" "}
              <Link href="/video-converter" className="font-medium text-accent hover:underline">
                video converter
              </Link>{" "}
              in particular are sized generously for this reason, since video files are typically
              the largest everyday file type people need to convert or shrink down for sharing.
            </p>
            <h2 className="!mt-8 font-display text-2xl font-semibold tracking-tight text-foreground">
              A free file converter that works on phones and tablets, not just desktop
            </h2>
            <p>
              Every tool on this site is built to work the same way on a phone or tablet browser
              as it does on a desktop computer, which matters most for the tools people actually
              reach for on mobile: converting a{" "}
              <Link href="/image-converter/heic-to-jpg" className="font-medium text-accent hover:underline">
                HEIC photo from an iPhone
              </Link>{" "}
              to JPG before sending it to someone with an Android phone, signing a PDF form with a
              finger on a touchscreen using the{" "}
              <Link href="/pdf-tools/sign-pdf" className="font-medium text-accent hover:underline">
                PDF signature tool
              </Link>
              , or quickly{" "}
              <Link href="/image-tools/compress-image" className="font-medium text-accent hover:underline">
                compressing a photo
              </Link>{" "}
              taken moments earlier so it fits an email attachment limit. Since nothing needs
              installing from an app store and no account needs creating, there is no meaningful
              difference between reaching for one of these tools on a laptop at a desk or on a
              phone between other tasks, a genuine advantage over desktop-only software that
              simply is not available away from that one installed computer.
            </p>
            <h2 className="!mt-8 font-display text-2xl font-semibold tracking-tight text-foreground">
              How this free online converter compares to paid software and other conversion sites
            </h2>
            <p>
              Desktop suites like Adobe Acrobat or dedicated video editing software offer deep,
              professional-grade feature sets, but they cost money, require installation, and are
              tied to one device. Many other free online converters offer similar convenience to
              this site on the surface, but route your file through a server to perform the
              conversion, meaning the file is uploaded before you ever see a result and is subject
              to whatever retention or deletion policy that particular site happens to have. This
              collection of tools aims to sit in a genuinely different spot: professional-enough
              results for the overwhelming majority of everyday PDF, image, document, audio, and
              video tasks, with none of the cost, installation, or upload-and-hope-it&apos;s-
              deleted tradeoffs either alternative asks for.
            </p>
          </div>
        </div>
      </section>

      {/* CTA — full-bleed metallic-emerald close (v3 design system),
          mirrors the hero treatment. SectionFlowLines white tone matches
          the hero's white-on-emerald choice; same "family" of animation,
          lighter density than the hero (see section-flow-lines.jsx for
          why: giving every section the hero's full density would be ~432
          animated paths across the page, verified excessive). */}
      <section className="relative isolate overflow-hidden">
        {/* Animated background isolated to its own layer — see
            hero-section.jsx for why metal-breathe (background-position
            only, no `filter`) must never sit on the same element as the
            text content, or the whole section flickers as the browser
            repaints the entire subtree every animation frame. */}
        <div
          className="pointer-events-none absolute inset-0 metallic-emerald-soft metallic-breathe"
          aria-hidden="true"
        />
        {/* Opacity-only brightness pulse, layered on top of the div above
            instead of inside it — see .metallic-breathe-glow in
            globals.css for why this replaced a `filter` animation on the
            layer itself. */}
        <div
          className="pointer-events-none absolute inset-0 metallic-breathe-glow"
          aria-hidden="true"
        />
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
