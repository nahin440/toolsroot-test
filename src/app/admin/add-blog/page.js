import { TOOLS, CATEGORIES } from "@/lib/registry/tools";
import { AddBlogForm } from "./add-blog-form";

export const metadata = {
  robots: { index: false, follow: false },
};

export default function AddBlogPage() {
  const toolOptions = TOOLS.map((t) => ({ slug: t.slug, name: t.name, category: t.category }));

  return (
    <div className="mx-auto max-w-[820px] px-4 py-10">
      <AddBlogForm tools={toolOptions} categories={CATEGORIES} />
    </div>
  );
}
