"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  HiOutlineClipboardDocumentCheck,
  HiOutlineArrowDownTray,
  HiOutlineCheckCircle,
  HiOutlineDocumentText,
} from "react-icons/hi2";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BLOG_CATEGORY_OPTIONS = ["pdf", "image", "document", "audio", "video", "archive"];

function slugifyPreview(input) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function AddBlogForm({ tools, categories }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slugOverride, setSlugOverride] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [selectedTools, setSelectedTools] = useState([]);
  const [toolFilter, setToolFilter] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // { snippet, slug, readingTime, instructions }

  const derivedSlug = slugifyPreview(slugOverride || title);

  const toolsByCategory = useMemo(() => {
    const filtered = toolFilter.trim()
      ? tools.filter((t) => t.name.toLowerCase().includes(toolFilter.trim().toLowerCase()))
      : tools;
    const grouped = {};
    for (const tool of filtered) {
      if (!grouped[tool.category]) grouped[tool.category] = [];
      grouped[tool.category].push(tool);
    }
    return grouped;
  }, [tools, toolFilter]);

  function toggleTool(slug) {
    setSelectedTools((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
    router.refresh();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);

    try {
      const res = await fetch("/api/admin/add-blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          slug: slugOverride.trim(),
          description: description.trim(),
          category,
          content: content.trim(),
          relatedTools: selectedTools,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Something went wrong.");
        setSubmitting(false);
        return;
      }

      setResult(data);
      toast.success("Snippet generated — paste it into blog-content.js.");
    } catch {
      toast.error("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleCopy() {
    if (!result) return;
    navigator.clipboard.writeText(result.snippet);
    toast.success("Copied to clipboard.");
  }

  function handleDownload() {
    if (!result) return;
    const blob = new Blob([result.snippet], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${result.slug}-snippet.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleStartAnother() {
    setTitle("");
    setSlugOverride("");
    setDescription("");
    setCategory("");
    setContent("");
    setSelectedTools([]);
    setResult(null);
  }

  if (result) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 text-accent">
            <HiOutlineCheckCircle className="size-5" />
            <CardTitle>Snippet ready</CardTitle>
          </div>
          <CardDescription>{result.instructions}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <pre className="max-h-[420px] overflow-auto rounded-xl bg-secondary p-4 text-xs leading-relaxed text-foreground">
            <code>{result.snippet}</code>
          </pre>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="accent" onClick={handleCopy}>
              <HiOutlineClipboardDocumentCheck className="size-4" />
              Copy snippet
            </Button>
            <Button type="button" variant="outline" onClick={handleDownload}>
              <HiOutlineArrowDownTray className="size-4" />
              Download .txt
            </Button>
            <Button type="button" variant="secondary" onClick={handleStartAnother}>
              Write another post
            </Button>
          </div>
          <div className="rounded-xl border border-border bg-secondary/50 p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Where it goes</p>
            <p className="mt-1">
              Open <code className="rounded bg-secondary px-1 py-0.5">src/lib/registry/blog-content.js</code>, paste
              this object as a new entry inside the <code className="rounded bg-secondary px-1 py-0.5">BLOG_POSTS</code>{" "}
              array (right after the opening <code className="rounded bg-secondary px-1 py-0.5">[</code> works fine),
              then commit and redeploy. The slug{" "}
              <code className="rounded bg-secondary px-1 py-0.5">{result.slug}</code> was checked against the
              current registry and is free to use.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <div className="flex items-center gap-2">
            <HiOutlineDocumentText className="size-5 text-accent" />
            <CardTitle>Add a blog post</CardTitle>
          </div>
          <CardDescription className="mt-1">
            Generates a ready-to-paste entry for blog-content.js.
          </CardDescription>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={handleLogout}>
          Log out
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="blog-title">Title</Label>
            <Input
              id="blog-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="How to Reduce PDF File Size Without Losing Quality"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="blog-slug">
              Slug <span className="text-muted-foreground font-normal">(optional — auto-generated from title)</span>
            </Label>
            <Input
              id="blog-slug"
              value={slugOverride}
              onChange={(e) => setSlugOverride(e.target.value)}
              placeholder={slugifyPreview(title) || "auto-generated-from-title"}
            />
            {derivedSlug && <p className="text-xs text-muted-foreground">URL: /blog/{derivedSlug}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="blog-description">Description</Label>
            <Textarea
              id="blog-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A one-to-two sentence summary — this becomes the meta description and the blog-listing preview text."
              rows={2}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="blog-category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="blog-category" className="w-full">
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
              <SelectContent>
                {BLOG_CATEGORY_OPTIONS.map((key) => (
                  <SelectItem key={key} value={key}>
                    {categories[key]?.label || key}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="blog-content">
              Content <span className="text-muted-foreground font-normal">(HTML — use &lt;h2&gt;, &lt;p&gt;, &lt;a&gt; tags)</span>
            </Label>
            <Textarea
              id="blog-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`<p>Opening paragraph...</p>\n\n<h2>A section heading</h2>\n<p>More content, linking to a tool like <a href="/pdf-tools/compress-pdf">Compress PDF</a> where relevant.</p>`}
              rows={14}
              className="font-mono text-xs"
              required
            />
            <p className="text-xs text-muted-foreground">
              {content
                .replace(/<[^>]+>/g, " ")
                .split(/\s+/)
                .filter(Boolean).length}{" "}
              words · minimum 200 required for meaningful SEO value
            </p>
          </div>

          <div className="space-y-1.5">
            <Label>Related tools</Label>
            <Input
              value={toolFilter}
              onChange={(e) => setToolFilter(e.target.value)}
              placeholder="Filter tools by name..."
              className="mb-2"
            />
            <div className="max-h-[280px] space-y-4 overflow-auto rounded-xl border border-border p-3">
              {Object.entries(toolsByCategory).map(([catKey, catTools]) => (
                <div key={catKey}>
                  <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {categories[catKey]?.label || catKey}
                  </p>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 sm:grid-cols-3">
                    {catTools.map((tool) => (
                      <label key={tool.slug} className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={selectedTools.includes(tool.slug)}
                          onCheckedChange={() => toggleTool(tool.slug)}
                        />
                        {tool.name}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              {Object.keys(toolsByCategory).length === 0 && (
                <p className="text-sm text-muted-foreground">No tools match &quot;{toolFilter}&quot;.</p>
              )}
            </div>
            {selectedTools.length > 0 && (
              <p className="text-xs text-muted-foreground">{selectedTools.length} tool(s) selected</p>
            )}
          </div>

          <Button type="submit" variant="accent" className="w-full" disabled={submitting}>
            {submitting ? "Generating..." : "Generate snippet"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
