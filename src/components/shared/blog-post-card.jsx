import Link from "next/link";
import Image from "next/image";
import { HiArrowRight, HiOutlineCalendar, HiOutlineClock } from "react-icons/hi2";

import { CATEGORIES } from "@/lib/registry/tools";

function formatDate(dateStr) {
  return new Date(dateStr + "T00:00:00Z").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function BlogPostCard({ post, headingLevel = "h3" }) {
  const category = CATEGORIES[post.category];
  const Heading = headingLevel;
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="glossy-card glossy-card-hover group flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card transition-[transform,border-color] duration-150 ease-[var(--ease-standard)] hover:-translate-y-1 hover:border-accent/30"
    >
      {post.image?.thumb && (
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-secondary">
          {/* fill requires a positioned (relative/absolute) ancestor
              with real dimensions, which the aspect-[16/10] container
              above already provides — this keeps the exact same
              crop/display behavior as the previous plain <img
              className="object-cover">, just through next/image so the
              browser gets responsive srcset + automatic AVIF/WebP
              negotiation instead of always downloading the raw 800px
              JPEG. `sizes` accounts for all four real call sites of
              this card (homepage, blog index, category page, tool-page
              "Related articles"): every site is 1-col below 640px,
              2-col at the sm breakpoint (the homepage alone jumps
              straight to 3-col at sm, so 50vw is still the safe/wider
              estimate there), and every site is 3-col by the lg
              breakpoint. */}
          <Image
            src={post.image.thumb}
            alt={post.image.alt || post.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            loading="lazy"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        <span className="inline-flex w-fit items-center rounded-full bg-accent-tint px-2.5 py-1 text-xs font-medium text-accent">
          {category.shortLabel}
        </span>
        <Heading className="font-display mt-3 text-lg leading-snug font-semibold tracking-tight text-foreground">
          {post.title}
        </Heading>
        <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{post.description}</p>
        <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <HiOutlineCalendar className="size-3.5" />
            {formatDate(post.publishedAt)}
          </span>
          <span className="inline-flex items-center gap-1">
            <HiOutlineClock className="size-3.5" />
            {post.readingTime}
          </span>
        </div>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent">
          Read article
          <HiArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
