import Link from "next/link";
import { HiChevronRight } from "react-icons/hi2";

import { ToolCard } from "@/components/home/tool-card";
import { ToolHero } from "@/components/tool-page/tool-hero";
import { BlogPostCard } from "@/components/shared/blog-post-card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/**
 * @param {object} props
 * @param {object} props.tool - registry tool entry
 * @param {object} props.category - registry category entry
 * @param {React.ReactNode} props.shell - the <ToolPageShell> instance for this tool
 * @param {{title: string, steps: string[]}} [props.howItWorks]
 * @param {{question: string, answer: string}[]} [props.faq]
 * @param {object[]} [props.relatedTools]
 * @param {object[]} [props.relatedArticles] - blog posts that named this tool in their relatedTools
 * @param {string} [props.longDescription]
 */
export function ToolPageLayout({
  tool,
  category,
  shell,
  howItWorks,
  faq,
  relatedTools = [],
  relatedArticles = [],
  longDescription,
}) {
  return (
    <div className="mx-auto max-w-[1000px] px-4 py-10 sm:px-6">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-accent">
          Home
        </Link>
        <HiChevronRight className="size-3.5" />
        <Link href={`/${category.slug}`} className="hover:text-accent">
          {category.label}
        </Link>
        <HiChevronRight className="size-3.5" />
        <span className="text-foreground">{tool.name}</span>
      </nav>

      <div className="mt-4 sm:-mx-6 lg:-mx-[140px]">
        <ToolHero tool={tool} />
      </div>

      <div className="mt-8">{shell}</div>

      {longDescription && (
        <div className="mt-16 max-w-none text-sm leading-relaxed text-muted-foreground [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_p]:mb-3">
          <div dangerouslySetInnerHTML={{ __html: longDescription }} />
        </div>
      )}

      {howItWorks && (
        <section className="mt-16">
          <h2 className="text-xl font-semibold text-foreground">{howItWorks.title}</h2>
          <ol className="mt-4 space-y-3">
            {howItWorks.steps.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-tint text-xs font-semibold text-accent">
                  {i + 1}
                </span>
                <span className="text-sm text-muted-foreground">{step}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {faq && faq.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-semibold text-foreground">Frequently asked questions</h2>
          <Accordion type="single" collapsible className="mt-2">
            {faq.map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left text-sm font-medium text-foreground">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      )}

      {relatedArticles.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-semibold text-foreground">Related articles</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {relatedArticles.map((post) => (
              <BlogPostCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      )}

      {relatedTools.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-semibold text-foreground">Related tools</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {relatedTools.map((t) => (
              <ToolCard key={t.slug} tool={t} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
