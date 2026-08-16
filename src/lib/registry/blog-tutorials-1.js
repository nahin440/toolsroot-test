// Blog content — Section B: Tutorials, part 1 of 2 (posts #55–#72).
// Matches the voice, structure, and internal-linking pattern of
// src/lib/registry/blog-content.js and new-blog-content.js: a short intro,
// H2-per-step or H2-per-idea sections, a practical decision-making close,
// and 2–4 contextual links into live tool pages using the /{categorySlug}/{toolSlug}
// URL pattern (or bare /{categorySlug} for the all-in-one converter hubs).

export const TUTORIAL_POSTS_1 = [
  {
    slug: "how-to-merge-pdf-files",
    title: "How to Merge PDF Files Into One Document",
    description:
      "Combine multiple PDFs into a single, correctly ordered file — what actually happens during a merge, and how to keep the result clean.",
    category: "pdf",
    publishedAt: "2026-05-04",
    readingTime: "4 min read",
    relatedTools: ["merge-pdf", "rearrange-pdf-pages", "compress-pdf"],
    image: {
      hero: "https://images.unsplash.com/photo-1568667256549-094345857637?w=1600&q=80&auto=format&fit=crop",
      thumb: "https://images.unsplash.com/photo-1568667256549-094345857637?w=800&q=75&auto=format&fit=crop",
      alt: "Stack of papers being organized into one document",
    },
    content: `
<p>Merging PDFs is one of those tasks that comes up constantly — combining scanned receipts for an expense report, stitching together chapters of a manuscript, or assembling a set of signed contracts into one file to send. It's also simple enough that it's worth understanding what's actually happening, so the result doesn't end up out of order or oddly formatted.</p>

<h2>What merging actually does</h2>
<p>A PDF merge takes the pages from each source file and combines them, in sequence, into a single new PDF. Nothing in the original pages is re-rendered or flattened in the process — text stays selectable, embedded fonts stay intact, and any existing bookmarks or links inside a source PDF are generally preserved. The only thing that changes is that what used to be several separate files is now one document with continuous page numbering.</p>

<h2>Step 1: Get your files in the right order before you upload</h2>
<p>Most merge tools combine files in the order you add them, so it's worth deciding on that order upfront — cover page first, appendices last, and so on. If you're not sure of the final order until you see the pages, don't worry: a good merge tool lets you drag files (or individual pages) into position after upload, so you can fix ordering visually instead of guessing blind.</p>

<h2>Step 2: Merge, then check page count and orientation</h2>
<p>Once merged, skim through quickly for two common issues: a page that's rotated sideways from the original file (this happens when a source PDF had a landscape page mixed into an otherwise portrait document), and any duplicate or missing pages if one of the source files was itself incomplete. Both are easy to fix at this stage and much more annoying to fix after the file has already been sent somewhere.</p>

<h2>Step 3: Compress if the result is too large to send</h2>
<p>Combining several PDFs, especially ones with scanned pages or images, can produce a file that's too large for an email attachment. If that happens, running the merged file through compression afterward is the right order of operations — compress once, on the final combined document, rather than compressing each source file separately beforehand.</p>

<h2>A note on merging scanned documents</h2>
<p>If some of your source files are scanned images rather than real PDFs with selectable text, merging them still works fine visually, but the text inside those pages won't be searchable or selectable. If you need the final merged document to be searchable, that's a separate step (OCR) worth doing either before or after the merge.</p>

<p><a href="/pdf-tools/merge-pdf">Merge PDF</a> combines any number of PDFs directly in your browser, with drag-and-drop reordering before you download. If the combined file needs to be smaller for sharing, follow up with <a href="/pdf-tools/compress-pdf">Compress PDF</a>, and if you need to reorder pages after the fact rather than before, <a href="/pdf-tools/rearrange-pdf-pages">Rearrange PDF Pages</a> handles that without requiring a re-merge.</p>
`,
  },

  {
    slug: "how-to-split-pdf-pages",
    title: "How to Split PDF Pages Into Separate Files",
    description:
      "Extracting specific pages from a PDF — whether you need one page out or want to break a large document into several smaller files.",
    category: "pdf",
    publishedAt: "2026-05-04",
    readingTime: "4 min read",
    relatedTools: ["split-pdf", "extract-pdf-pages", "merge-pdf"],
    image: {
      hero: "https://images.unsplash.com/photo-1568667256549-094345857637?w=1600&q=80&auto=format&fit=crop",
      thumb: "https://images.unsplash.com/photo-1568667256549-094345857637?w=800&q=75&auto=format&fit=crop",
      alt: "Document pages being separated on a desk",
    },
    content: `
<p>Splitting a PDF covers two genuinely different needs that people often lump together: pulling a handful of specific pages out of a larger document, and breaking one large PDF into several smaller files (say, one file per chapter). Knowing which one you actually need makes the process faster.</p>

<h2>Pulling specific pages vs. splitting into chunks</h2>
<p>If you need pages 4, 9, and 12 out of a 40-page report, that's page extraction — you're selecting individual pages and getting them out as a new, smaller PDF. If instead you want to break a 100-page document into ten 10-page files, that's splitting into ranges. Tools sometimes handle both under one "split" label, but the workflow for each is different: extraction is selection-based, and range-splitting is usually done by specifying page breaks.</p>

<h2>How to extract specific pages</h2>
<p>Upload the source PDF, then select the exact pages you want (most tools show thumbnails so you can visually pick them rather than guessing page numbers from a list). The result is a new PDF containing only those pages, in the order you selected them — useful for pulling just the signature page out of a long contract, or grabbing a single chart from a report to share separately.</p>

<h2>How to split into multiple smaller files</h2>
<p>For breaking a large document into chunks, you'll typically set page ranges (pages 1–20, 21–40, and so on) or split at every N pages. This is the more useful mode when a document is genuinely too large to be one file — say, a scanned book you want divided by chapter, or a large report you're distributing to different people who each only need one section.</p>

<h2>What happens to the original</h2>
<p>Splitting never modifies your original PDF — it stays exactly as it was, and the tool produces new files from it. That means it's safe to experiment: extract a test page, check it looks right, then extract the full set you actually need.</p>

<p><a href="/pdf-tools/split-pdf">Split PDF</a> handles breaking a document into page ranges, while <a href="/pdf-tools/extract-pdf-pages">Extract PDF Pages</a> is built specifically for pulling out a chosen set of individual pages. If you later need to recombine files you've split apart, <a href="/pdf-tools/merge-pdf">Merge PDF</a> handles that in reverse.</p>
`,
  },

  {
    slug: "how-to-rotate-pdf-pages",
    title: "How to Rotate PDF Pages the Right Way",
    description:
      "Fixing sideways or upside-down pages in a PDF — including the common case where only some pages in a document need rotating.",
    category: "pdf",
    publishedAt: "2026-05-04",
    readingTime: "3 min read",
    relatedTools: ["rotate-pdf", "merge-pdf"],
    image: {
      hero: "https://images.unsplash.com/photo-1568667256549-094345857637?w=1600&q=80&auto=format&fit=crop",
      thumb: "https://images.unsplash.com/photo-1568667256549-094345857637?w=800&q=75&auto=format&fit=crop",
      alt: "Papers oriented at different angles on a table",
    },
    content: `
<p>A sideways page in a PDF is one of the most common (and most annoying) small formatting problems, usually caused by scanning a landscape document, photographing a page in the wrong orientation, or exporting from software that got the page setup wrong. Fixing it is quick, but worth doing properly rather than just squinting at a rotated page every time you open the file.</p>

<h2>Why pages end up sideways in the first place</h2>
<p>The most common cause is a physical scanner fed a mixed batch of portrait and landscape pages, which it scans at whatever orientation the paper happened to go in. The second most common cause is a photo taken with a phone held sideways, then converted straight to PDF without correcting orientation first. Either way, the fix is the same: rotate the affected pages back to how they should read.</p>

<h2>Rotating the whole document vs. individual pages</h2>
<p>If every page in a PDF is rotated the same wrong way, a single whole-document rotation fixes it in one step. But it's common for only a handful of pages within an otherwise correct document to be sideways — a landscape chart mixed into a portrait report, for instance. In that case, you want per-page rotation, applying a 90°, 180°, or 270° turn to just the affected pages while leaving the rest untouched.</p>

<h2>Getting the direction right</h2>
<p>A page that needs to be turned clockwise to read correctly should be rotated clockwise, not counterclockwise — rotating the wrong direction just turns a sideways page upside down instead of fixing it. Most tools show a live preview of each page as you rotate it, which makes it easy to confirm the direction is right before saving, rather than rotating blind and re-checking afterward.</p>

<h2>Saving the result</h2>
<p>Once pages are rotated correctly, the orientation is saved as part of the PDF itself — it'll display correctly for anyone who opens it afterward, not just in the tool you used to fix it, and it'll also print in the correct orientation.</p>

<p><a href="/pdf-tools/rotate-pdf">Rotate PDF</a> lets you rotate an entire document or select individual pages to turn, with a live preview so you can confirm the orientation before downloading. If the sideways pages came from combining several source files, our guide on <a href="/blog/how-to-merge-pdf-files">merging PDF files</a> covers how to check for orientation issues as part of that process.</p>
`,
  },

  {
    slug: "how-to-delete-pdf-pages",
    title: "How to Delete Pages From a PDF",
    description:
      "Removing unwanted, blank, or outdated pages from a PDF without disturbing the rest of the document.",
    category: "pdf",
    publishedAt: "2026-05-04",
    readingTime: "3 min read",
    relatedTools: ["delete-pdf-pages", "rearrange-pdf-pages", "split-pdf"],
    image: {
      hero: "https://images.unsplash.com/photo-1568667256549-094345857637?w=1600&q=80&auto=format&fit=crop",
      thumb: "https://images.unsplash.com/photo-1568667256549-094345857637?w=800&q=75&auto=format&fit=crop",
      alt: "Person reviewing and removing pages from a document",
    },
    content: `
<p>Blank pages left over from scanning, an outdated cover sheet, a page of internal notes that shouldn't go out with the final document — deleting pages from a PDF is a small edit that comes up often, and it's one of the easier PDF tasks to get right since there's very little that can go wrong.</p>

<h2>Selecting the right pages</h2>
<p>The main thing to get right is confirming you're deleting the actual pages you mean to. Tools that show a visual thumbnail grid of every page are meaningfully easier to work with here than ones that just ask for a list of page numbers — it's much harder to accidentally delete the wrong page when you can see it before removing it, especially in a longer document where miscounting by one is an easy mistake.</p>

<h2>Deleting multiple, non-consecutive pages</h2>
<p>You're not limited to removing a single contiguous block — most tools let you select any combination of pages (say, page 3, page 7, and pages 15 through 18) and remove all of them in one pass, producing a single cleaned-up document rather than requiring several separate edit rounds.</p>

<h2>What happens to page numbers</h2>
<p>Once pages are removed, the remaining pages shift up to fill the gap — page 8 becomes page 7 if page 3 was deleted, for instance. If your document has printed page numbers as part of the actual content (rather than relying on the PDF's internal page count), those printed numbers won't automatically update — worth checking if the document is the kind where page-number continuity matters, like a numbered legal filing.</p>

<h2>Double-checking before you save</h2>
<p>Since page deletion is straightforward, the main failure mode is simply deleting the wrong page by mistake. A quick scroll through the result before finalizing — confirming the page count matches what you expected and nothing important got caught in the selection — takes a few seconds and avoids having to start over.</p>

<p><a href="/pdf-tools/delete-pdf-pages">Delete PDF Pages</a> shows a full thumbnail grid so you can select exactly which pages to remove before downloading the cleaned-up file. If you need to reorder the remaining pages afterward, <a href="/pdf-tools/rearrange-pdf-pages">Rearrange PDF Pages</a> handles that, and if your goal is actually splitting a document into separate files rather than discarding pages, see our guide on <a href="/blog/how-to-split-pdf-pages">how to split PDF pages</a>.</p>
`,
  },

  {
    slug: "how-to-convert-word-to-pdf",
    title: "How to Convert Word to PDF Without Losing Formatting",
    description:
      "Turning a Word document into a PDF while keeping fonts, layout, images, and page breaks exactly where they should be.",
    category: "document",
    publishedAt: "2026-05-04",
    readingTime: "4 min read",
    relatedTools: ["word-to-pdf", "pdf-to-word"],
    image: {
      hero: "https://images.unsplash.com/photo-1562240020-ce31ccb0fa7d?w=1600&q=80&auto=format&fit=crop",
      thumb: "https://images.unsplash.com/photo-1562240020-ce31ccb0fa7d?w=800&q=75&auto=format&fit=crop",
      alt: "Business document being finalized for sharing",
    },
    content: `
<p>Converting a Word document to PDF is usually about getting a version that looks identical everywhere it's opened, rather than one that shifts around depending on what software and fonts happen to be installed on the recipient's device. It's a common last step before sending a resume, contract, report, or invoice.</p>

<h2>Why convert to PDF at all</h2>
<p>A .docx file's layout can shift subtly (or not so subtly) depending on the fonts installed, the version of Word or other word processor used to open it, and even the operating system's default line spacing. A PDF locks the layout in place — what you see when you export it is what everyone sees when they open it, regardless of what software they're using. That predictability is exactly why PDF is the standard format for anything meant to be read and not edited: invoices, signed agreements, final reports, resumes.</p>

<h2>What a good conversion preserves</h2>
<p>A proper Word-to-PDF conversion should carry over fonts (embedding them into the PDF so they display correctly even if the reader doesn't have that font installed), exact page breaks and margins, embedded images at their original placement and resolution, and any tables, headers, footers, or footnotes exactly as they appeared in the original. If any of these shift during conversion, something in the process reflowed the document rather than translating it directly.</p>

<h2>Where formatting problems usually come from</h2>
<p>The most common cause of formatting drift isn't the conversion tool itself — it's a document built with inconsistent manual formatting to begin with (extra spaces instead of proper indentation, manually resized images instead of consistent sizing, mismatched fonts pasted in from other sources). A conversion tool can only faithfully translate what's actually in the document; it can't fix underlying inconsistencies that were already there.</p>

<h2>Checking the result</h2>
<p>After converting, it's worth a quick scroll through the PDF to confirm page breaks landed where expected and no text got cut off at a page edge — this matters most for documents with tables or images near the bottom of a page, which are the most likely spot for something to shift.</p>

<p><a href="/document-tools/word-to-pdf">Word to PDF</a> converts .docx files directly in your browser, preserving fonts, layout, and embedded images without needing Word installed. If you're troubleshooting formatting that looks different after converting, our guide on <a href="/blog/word-to-pdf-formatting-guide">why Word documents sometimes look different as a PDF</a> goes deeper into the common causes. Need to go the other direction? <a href="/document-tools/pdf-to-word">PDF to Word</a> converts back to an editable document.</p>
`,
  },

  {
    slug: "how-to-convert-pdf-to-word",
    title: "How to Convert PDF to Word for Editing",
    description:
      "Turning a static PDF into an editable Word document — what converts cleanly, what doesn't, and how to get the best possible result.",
    category: "document",
    publishedAt: "2026-05-04",
    readingTime: "5 min read",
    relatedTools: ["pdf-to-word", "word-to-pdf", "ocr-pdf"],
    image: {
      hero: "https://images.unsplash.com/photo-1562240020-ce31ccb0fa7d?w=1600&q=80&auto=format&fit=crop",
      thumb: "https://images.unsplash.com/photo-1562240020-ce31ccb0fa7d?w=800&q=75&auto=format&fit=crop",
      alt: "Editing a document that was originally a fixed PDF",
    },
    content: `
<p>PDFs are deliberately hard to edit — that's the point of the format. But it's common to need to edit one anyway: updating an old contract template, revising a report someone sent you as a PDF, or recovering content from a file whose original source document is long gone. Converting to Word is the practical way in.</p>

<h2>What determines how well this works</h2>
<p>The single biggest factor is whether the PDF was created digitally (exported from Word, Google Docs, or similar) or produced from a scan or photo. A digitally created PDF contains real text data, and converting it to Word can recover that text, along with reasonably accurate formatting, tables, and layout. A scanned PDF contains no text at all — just an image of a page — so a direct conversion has nothing to extract, and the result will just be an image pasted into a Word document rather than editable text.</p>

<h2>Converting a text-based PDF</h2>
<p>For a PDF that already contains selectable text, conversion involves reading the document's underlying structure — text blocks, tables, fonts, spacing — and rebuilding it as an equivalent Word document. Simple, single-column documents convert most cleanly; complex multi-column layouts, PDFs with heavy custom formatting, or documents with lots of overlapping text boxes are more likely to need manual cleanup afterward, since Word's layout model doesn't map perfectly onto every kind of PDF layout.</p>

<h2>Converting a scanned PDF</h2>
<p>If your PDF is a scan, you need OCR (optical character recognition) first — a process that analyzes the image of each page and recognizes the actual text characters within it, which can then be extracted and placed into an editable document. Skipping this step and converting a scanned PDF directly to Word will produce a document that looks right but has no real, editable text underneath.</p>

<h2>What to expect after converting</h2>
<p>Even a clean conversion is a best-effort reconstruction, not a perfect original-source recovery — expect to do a quick pass checking fonts, spacing, and any tables that might need minor adjustment, especially in documents with complex layouts. For straightforward documents like letters, simple reports, and single-column text, the result is usually close to ready to use as-is.</p>

<p><a href="/document-tools/pdf-to-word">PDF to Word</a> converts PDFs directly in your browser and works best on PDFs with real underlying text. If your source document is a scan or photo, run it through <a href="/pdf-tools/ocr-pdf">OCR PDF</a> first to make the text recognizable, then convert. To go back the other way once you're done editing, <a href="/document-tools/word-to-pdf">Word to PDF</a> handles that.</p>
`,
  },

  {
    slug: "how-to-convert-excel-to-pdf",
    title: "How to Convert Excel to PDF for Sharing",
    description:
      "Turning a spreadsheet into a clean, properly paginated PDF — including the print-area and scaling issues that cause most Excel-to-PDF problems.",
    category: "document",
    publishedAt: "2026-05-11",
    readingTime: "4 min read",
    relatedTools: ["excel-to-pdf", "pdf-to-excel"],
    image: {
      hero: "https://images.unsplash.com/photo-1543286386-713bdd548da4?w=1600&q=80&auto=format&fit=crop",
      thumb: "https://images.unsplash.com/photo-1543286386-713bdd548da4?w=800&q=75&auto=format&fit=crop",
      alt: "Spreadsheet data being prepared for a professional report",
    },
    content: `
<p>Sending a spreadsheet as a PDF rather than an .xlsx file is usually about making sure the recipient sees exactly the data you intended, laid out the way you intended, without needing Excel installed or accidentally editing a formula. It's a common last step for invoices, financial summaries, and reports built in spreadsheet form.</p>

<h2>Why spreadsheets are trickier to convert than documents</h2>
<p>Unlike a Word document, which has a defined page size built in, a spreadsheet is technically an unbounded grid — there's no inherent "page" until you convert it to one. That's why Excel-to-PDF conversions are the most likely of any document conversion to have pagination problems: columns getting cut off at a page edge, an unexpectedly large number of mostly-empty pages, or a print area that doesn't match what you actually wanted to share.</p>

<h2>Setting the print area first</h2>
<p>Before converting, check whether the spreadsheet has a defined print area that matches what you want in the PDF — if it doesn't, a conversion might include every populated cell in the sheet, including data far outside your intended view. Setting a specific print range, or hiding irrelevant columns before converting, is the single most effective way to avoid overly wide or oddly paginated output.</p>

<h2>Fitting columns onto the page</h2>
<p>Wide spreadsheets are the main source of ugly Excel-to-PDF conversions — a table with 15 columns of financial data doesn't fit naturally onto a portrait page, and if nothing accounts for that, columns get cut off or continued awkwardly onto extra pages. Setting orientation to landscape, or using a fit-to-width scaling option, keeps a wide table together on one page rather than split across several.</p>

<h2>What converts reliably</h2>
<p>Cell values, formatting (bold, borders, cell colors), and basic charts generally convert cleanly, since these translate directly to static visual content. Things like interactive filters, pivot table controls, or cell comments won't carry over in any meaningful interactive form — a PDF is a snapshot, not a live spreadsheet, so anything that depends on interactivity is inherently lost in the conversion.</p>

<p><a href="/document-tools/excel-to-pdf">Excel to PDF</a> converts spreadsheets directly in your browser, preserving formatting and layout as a properly paginated document. If the recipient needs to get back to editable data later, <a href="/document-tools/pdf-to-excel">PDF to Excel</a> handles the reverse conversion, extracting tabular data back into spreadsheet form.</p>
`,
  },

  {
    slug: "how-to-convert-powerpoint-to-pdf",
    title: "How to Convert PowerPoint to PDF for Presentation-Ready Files",
    description:
      "Turning a slide deck into a PDF that displays correctly everywhere — covering fonts, animations, and what a static export leaves behind.",
    category: "document",
    publishedAt: "2026-05-11",
    readingTime: "4 min read",
    relatedTools: ["powerpoint-to-pdf", "pdf-to-powerpoint"],
    image: {
      hero: "https://images.unsplash.com/photo-1543286386-713bdd548da4?w=1600&q=80&auto=format&fit=crop",
      thumb: "https://images.unsplash.com/photo-1543286386-713bdd548da4?w=800&q=75&auto=format&fit=crop",
      alt: "Presentation slides laid out for review",
    },
    content: `
<p>Converting a PowerPoint deck to PDF is the standard way to share slides with someone who doesn't need to edit them — sending a proposal, distributing handout copies before a talk, or archiving a final version of a presentation that shouldn't change after the fact.</p>

<h2>What a PDF export actually captures</h2>
<p>A PDF is a static, page-based format, so converting a slide deck to PDF captures each slide as it appears at a single moment — meaning any animations, slide transitions, or embedded video/audio won't carry over in their interactive form. What you get is the visual layout of each slide: text, images, charts, and formatting, exactly as they'd appear if you paused the presentation on that slide.</p>

<h2>Fonts are the most common snag</h2>
<p>If a presentation uses a font that isn't one of the common system defaults, a proper conversion needs to embed that font into the PDF so it displays correctly on any device — otherwise, the PDF might silently substitute a different font and throw off spacing, line breaks, or the overall look of a carefully designed slide. This is the single most common cause of a PowerPoint-to-PDF conversion looking subtly "off" compared to the original.</p>

<h2>Handling animated builds and hidden slides</h2>
<p>If a slide uses build animations (bullet points appearing one at a time, for instance), a PDF export typically shows the slide's final state — everything visible at once — since a PDF page can't represent a sequence of animation steps. If you specifically need each build step as its own page, that generally requires exporting from PowerPoint's own "each animation as a slide" setting before conversion, since a converter working from the final .pptx file only sees the finished state. Hidden slides usually aren't included in the export at all, which is worth checking if your deck has any.</p>

<h2>Speaker notes</h2>
<p>By default, most conversions export just the slide content, not the speaker notes underneath. If you need notes included — for a handout version, say — check whether your conversion tool has a "notes pages" layout option, since the standard export usually leaves them out.</p>

<p><a href="/document-tools/powerpoint-to-pdf">PowerPoint to PDF</a> converts .pptx files directly in your browser, embedding fonts and preserving slide layout for a presentation-ready file. If you need to extract editable slides back out of a PDF later, <a href="/document-tools/pdf-to-powerpoint">PDF to PowerPoint</a> handles that conversion in reverse.</p>
`,
  },

  {
    slug: "how-to-convert-jpg-to-pdf",
    title: "How to Convert JPG to PDF",
    description:
      "Turning one or several JPG images into a single PDF document — useful for scanned pages, receipts, and photo collections you want as one file.",
    category: "pdf",
    publishedAt: "2026-05-11",
    readingTime: "3 min read",
    relatedTools: ["jpg-to-pdf", "convert-image-to-pdf", "merge-pdf"],
    image: {
      hero: "https://images.unsplash.com/photo-1568667256549-094345857637?w=1600&q=80&auto=format&fit=crop",
      thumb: "https://images.unsplash.com/photo-1568667256549-094345857637?w=800&q=75&auto=format&fit=crop",
      alt: "Photographs being organized into a document",
    },
    content: `
<p>Turning JPG images into a PDF is one of the most common everyday file tasks — photographed receipts for an expense report, phone-scanned pages of a document, or a set of images you just want bundled as one file rather than several loose attachments.</p>

<h2>One image or several, in one pass</h2>
<p>A JPG-to-PDF conversion isn't limited to a single image — you can typically select several JPGs at once, and the tool combines them into one multi-page PDF, with each image becoming its own page in the order you arranged them. This is the fastest way to turn a stack of photographed pages into a single document without needing a dedicated scanning app.</p>

<h2>Getting the page order right</h2>
<p>If you're combining multiple images — say, five photographed pages of a receipt or contract — the order they're added usually determines the order of pages in the final PDF. Tools with drag-and-drop reordering make this much easier to get right than ones that rely purely on filename or upload order, since you can visually confirm the sequence before generating the file.</p>

<h2>What happens to image quality</h2>
<p>A well-built JPG-to-PDF conversion embeds the images into the PDF without needlessly re-compressing them, so the visual quality in the resulting PDF should closely match the source JPGs. If the images were already low-resolution or heavily compressed going in, the PDF will reflect that same quality — conversion doesn't add detail that wasn't in the source photo.</p>

<h2>Page size and orientation</h2>
<p>Most tools default to fitting each image onto a standard page size (like Letter or A4), which can add white space around images with a different aspect ratio, or offer an option to size each PDF page to match the image exactly. If you're combining a mix of portrait and landscape photos, check how the tool handles orientation — some auto-rotate pages to fit each image best, while others keep a single consistent orientation throughout.</p>

<p><a href="/pdf-tools/jpg-to-pdf">JPG to PDF</a> converts one or several JPG images into a single PDF directly in your browser, with drag-and-drop page reordering. For other image formats, <a href="/pdf-tools/convert-image-to-pdf">Convert Image to PDF</a> handles PNG, WEBP, and more the same way. If you need to combine the result with an existing PDF, <a href="/pdf-tools/merge-pdf">Merge PDF</a> can join them together afterward.</p>
`,
  },

  {
    slug: "how-to-convert-png-to-jpg",
    title: "How to Convert PNG to JPG",
    description:
      "Switching from PNG to JPG to shrink file size and improve compatibility — and what you should know before you do, since it's a one-way trade.",
    category: "image",
    publishedAt: "2026-05-11",
    readingTime: "3 min read",
    relatedTools: ["png-to-jpg", "compress-image", "convert-image"],
    image: {
      hero: "https://images.unsplash.com/photo-1753164597338-9fe623b2d21c?w=1600&q=80&auto=format&fit=crop",
      thumb: "https://images.unsplash.com/photo-1753164597338-9fe623b2d21c?w=800&q=75&auto=format&fit=crop",
      alt: "Photo editing workspace with image files",
    },
    content: `
<p>Converting a PNG to JPG is usually about file size — PNGs can be considerably larger than an equivalent JPG, especially for photographs, and that size difference matters when you're uploading, emailing, or trying to keep a website fast. It's a quick conversion, with one tradeoff worth understanding before you do it.</p>

<h2>The tradeoff: no more transparency</h2>
<p>JPG doesn't support transparency at all, so converting a PNG with a transparent background to JPG fills that transparent area with a solid color (almost always white) instead. This is fine for a PNG that never actually used transparency — a screenshot or a photo saved as PNG, for instance — but it will visibly change a logo or icon that relies on a see-through background, since that transparency simply can't exist in a JPG.</p>

<h2>Why the file size drops so much</h2>
<p>PNG is lossless, meaning it preserves every pixel exactly, which is precise but expensive in file size. JPG uses lossy compression, discarding some visual detail (in a way that's largely imperceptible at higher quality settings) in exchange for a much smaller file. For photographs specifically, this trade is usually a clear win — the human eye doesn't notice the difference at normal viewing sizes, but the file size difference is substantial.</p>

<h2>When PNG is genuinely the better choice to keep</h2>
<p>Screenshots, graphics with sharp text or clean lines, and anything with a transparent background are better left as PNG — JPG's compression tends to blur fine edges and introduce visible artifacts around sharp text, which is exactly the kind of image PNG handles best. Converting these to JPG to save space usually isn't worth the visible quality loss.</p>

<h2>Choosing a quality setting</h2>
<p>Most converters let you set a JPG quality level — higher quality means larger files with less visible compression, lower quality means smaller files with more visible artifacts. For most photos, a quality setting in the 75–85% range is a reasonable default: meaningfully smaller than the source PNG, with compression artifacts that are hard to spot at normal viewing size.</p>

<p><a href="/image-converter/png-to-jpg">PNG to JPG</a> handles this conversion directly in your browser with adjustable quality. If file size is the main goal and you want to keep the PNG format, <a href="/image-tools/compress-image">Compress Image</a> can shrink a PNG without converting it at all. For other format pairs, <a href="/image-converter/convert-image">the image converter</a> covers the rest.</p>
`,
  },

  {
    slug: "how-to-convert-jpg-to-png",
    title: "How to Convert JPG to PNG",
    description:
      "Moving from JPG to PNG when you need lossless quality or a transparent background — and what actually changes (and doesn't) in the process.",
    category: "image",
    publishedAt: "2026-05-11",
    readingTime: "3 min read",
    relatedTools: ["jpg-to-png", "remove-background", "convert-image"],
    image: {
      hero: "https://images.unsplash.com/photo-1753164597338-9fe623b2d21c?w=1600&q=80&auto=format&fit=crop",
      thumb: "https://images.unsplash.com/photo-1753164597338-9fe623b2d21c?w=800&q=75&auto=format&fit=crop",
      alt: "Graphic design work involving image formats",
    },
    content: `
<p>Converting a JPG to PNG comes up most often when a JPG needs to go somewhere that requires (or benefits from) lossless quality, or as a first step before adding transparency — say, before removing a background. It's a straightforward conversion with one important limitation worth knowing upfront.</p>

<h2>What conversion can't undo</h2>
<p>JPG's compression is lossy — some image detail is discarded permanently when a JPG is saved, and that data doesn't come back just because you convert the file to a lossless format afterward. Converting a JPG to PNG locks in whatever quality the JPG already had; it doesn't restore detail that JPG's compression already threw away. If you need genuinely lossless quality, that has to start from an uncompressed or lossless source, not from an existing JPG.</p>

<h2>So why convert JPG to PNG at all?</h2>
<p>A few legitimate reasons: some software or upload systems specifically require PNG and reject JPG; you're about to make edits (like removing a background) that need PNG's transparency support, even though the source photo doesn't have transparency yet; or you want to avoid further generational quality loss from repeated JPG re-saves, since every additional JPG export recompresses and loses a little more detail, while PNG re-saves don't.</p>

<h2>The file size will go up</h2>
<p>Since PNG is lossless and JPG is compressed, converting to PNG generally increases file size — sometimes substantially, especially for photographic images with lots of color variation. This is expected and not a sign anything went wrong; it's simply the cost of a lossless format storing every pixel rather than a compressed approximation.</p>

<h2>Adding transparency after converting</h2>
<p>Converting to PNG on its own doesn't add transparency — a JPG has no transparency data to carry over, so the resulting PNG still has a solid background just like the original. If your goal is a see-through background (for a product photo or a logo, say), that requires a separate background-removal step after the format is converted to PNG.</p>

<p><a href="/image-converter/jpg-to-png">JPG to PNG</a> converts your file directly in your browser. If your next step is making the background transparent, <a href="/image-tools/remove-background">Remove Background</a> handles that automatically once you're working in PNG. For other format conversions, <a href="/image-converter/convert-image">the image converter</a> covers the full range of pairs.</p>
`,
  },

  {
    slug: "how-to-convert-webp-to-png",
    title: "How to Convert WEBP to PNG",
    description:
      "Converting WEBP images back to PNG for compatibility with older software or platforms that don't yet support the newer format.",
    category: "image",
    publishedAt: "2026-05-11",
    readingTime: "3 min read",
    relatedTools: ["convert-image", "webp-to-png"],
    image: {
      hero: "https://images.unsplash.com/photo-1753164597338-9fe623b2d21c?w=1600&q=80&auto=format&fit=crop",
      thumb: "https://images.unsplash.com/photo-1753164597338-9fe623b2d21c?w=800&q=75&auto=format&fit=crop",
      alt: "Website images being prepared for compatibility",
    },
    content: `
<p>WEBP is a genuinely more efficient format than PNG in most cases — smaller files at equivalent quality — but it's not universally supported yet, so converting a WEBP image back to PNG comes up whenever you hit software, a platform, or an older device that doesn't handle WEBP properly.</p>

<h2>Why you'd need to convert away from a "better" format</h2>
<p>WEBP support has become broad across modern browsers and operating systems, but plenty of older software, some design tools, and certain upload systems still only accept the more established formats. If you've downloaded an image as WEBP (a common default on many websites now) and need to use it somewhere that rejects that extension outright, converting to PNG is the fix — trading some file size efficiency for near-universal compatibility.</p>

<h2>What's preserved in the conversion</h2>
<p>If the source WEBP was saved losslessly, converting to PNG preserves that quality exactly — both are lossless formats, so nothing is discarded in the conversion. If the WEBP was saved with lossy compression, the PNG conversion locks in whatever quality that lossy compression left behind (same as converting any lossy image to a lossless format) — it won't restore detail the original compression already removed, it just stops further loss from happening.</p>

<h2>Transparency carries over correctly</h2>
<p>Both WEBP and PNG support an alpha channel for transparency, so if your source WEBP has a transparent background, that transparency converts cleanly to PNG — nothing needs to be redone or re-added.</p>

<h2>Expect a larger file</h2>
<p>Since PNG doesn't compress as efficiently as WEBP for most images, expect the converted PNG to be noticeably larger than the original WEBP file. That's the direct cost of trading WEBP's efficiency for PNG's broader compatibility, and it's worth being aware of if you're converting a large batch of images for a website that cares about load time.</p>

<p><a href="/image-converter/convert-image">The image converter</a> handles WEBP to PNG directly in your browser, along with every other common format pair. If file size becomes a concern after converting, <a href="/image-tools/compress-image">Compress Image</a> can bring the resulting PNG back down without changing the format again.</p>
`,
  },

  {
    slug: "how-to-resize-images",
    title: "How to Resize Images Without Distortion",
    description:
      "Changing an image's dimensions the right way — keeping proportions correct, avoiding blur, and picking the right size for where the image is going.",
    category: "image",
    publishedAt: "2026-05-18",
    readingTime: "4 min read",
    relatedTools: ["resize-image", "compress-image", "image-upscaler"],
    image: {
      hero: "https://images.unsplash.com/photo-1753164597338-9fe623b2d21c?w=1600&q=80&auto=format&fit=crop",
      thumb: "https://images.unsplash.com/photo-1753164597338-9fe623b2d21c?w=800&q=75&auto=format&fit=crop",
      alt: "Resizing photo dimensions on a screen",
    },
    content: `
<p>Resizing an image sounds simple — and mostly is — but it's also the source of one of the most common image problems: a photo that looks stretched, squashed, or blurry because the resize wasn't done quite right. A few basic rules avoid all of that.</p>

<h2>Lock the aspect ratio, unless you specifically want to distort it</h2>
<p>An image's aspect ratio is the relationship between its width and height. If you resize width and height independently without keeping that ratio locked, the image stretches or squashes — a circle becomes an oval, a face looks subtly warped. Almost every legitimate resize should keep the aspect ratio locked, changing width and height together proportionally, so the image just gets smaller or larger without any distortion.</p>

<h2>Making an image smaller is safe; making it bigger is not</h2>
<p>Shrinking an image down is essentially lossless in terms of visible quality — you're just displaying the same visual information at a smaller size. Enlarging an image, on the other hand, means the software has to invent new pixel detail that wasn't in the original, which is why simply stretching a small image up to a larger size usually looks soft or blurry. If you genuinely need a higher-resolution version of an image than what you have, a basic resize isn't the right tool for that — you'd need dedicated upscaling, which uses more sophisticated techniques to add believable detail rather than just stretching existing pixels.</p>

<h2>Picking the right dimensions for where it's going</h2>
<p>The correct size depends entirely on the destination: a website hero image might need to be 1920 pixels wide, a social media profile photo often wants a specific square size, and an email attachment benefits from being small enough to load quickly. Resizing to match the actual destination — rather than just uploading whatever size the original photo happened to be — avoids both unnecessarily large files and images that look undersized once placed.</p>

<h2>Resizing by exact dimensions vs. by percentage</h2>
<p>Some tools let you resize by exact pixel dimensions (useful when a platform has a specific required size), and others let you resize by percentage (useful for just generally shrinking an image without a specific target in mind). Knowing which one you actually need saves a step — if you have a specific pixel requirement, don't eyeball a percentage and check afterward.</p>

<p><a href="/image-tools/resize-image">Resize Image</a> handles exact-dimension and proportional resizing directly in your browser, with the aspect ratio locked by default to avoid distortion. If you need to genuinely increase resolution rather than just resize, <a href="/image-tools/image-upscaler">Image Upscaler</a> is built for that. Once resized, <a href="/image-tools/compress-image">Compress Image</a> can bring the file size down further if needed.</p>
`,
  },

  {
    slug: "how-to-crop-images",
    title: "How to Crop Images Cleanly",
    description:
      "Removing unwanted parts of a photo the right way — including how to crop to a specific aspect ratio for social media, printing, or web use.",
    category: "image",
    publishedAt: "2026-05-18",
    readingTime: "3 min read",
    relatedTools: ["crop-image", "resize-image"],
    image: {
      hero: "https://images.unsplash.com/photo-1753164597338-9fe623b2d21c?w=1600&q=80&auto=format&fit=crop",
      thumb: "https://images.unsplash.com/photo-1753164597338-9fe623b2d21c?w=800&q=75&auto=format&fit=crop",
      alt: "Adjusting a photo crop frame",
    },
    content: `
<p>Cropping is one of the simplest and most useful photo edits — cutting away distracting background, focusing attention on the actual subject, or fitting an image to a specific shape a platform requires. It's quick to do, but a couple of small habits make the difference between a clean crop and an awkward one.</p>

<h2>Crop to a purpose, not just visually</h2>
<p>Before dragging a crop box around, it helps to know what the image is actually for. A profile photo usually needs a square or near-square crop. A banner or cover image needs a wide, short crop. A printed photo needs to match a standard print ratio (like 4:3 or 3:2) or important content gets cut off at the edges when it's actually printed. Cropping with the destination in mind from the start avoids having to redo the crop later when it turns out the shape doesn't fit.</p>

<h2>Watch what's near the edges of your crop</h2>
<p>The most common cropping mistake is cutting off part of the subject that should have stayed in frame — the top of someone's head, part of a logo, an important detail near the edge of the photo. Zooming in slightly before finalizing a crop, rather than trusting a quick visual glance, catches this kind of edge-clipping before it becomes a problem in the final image.</p>

<h2>Using a fixed aspect ratio for consistency</h2>
<p>If you're cropping several images that need to look consistent together — a set of product photos, or a batch of images for the same social media grid — using a fixed aspect ratio setting (rather than freehand cropping each one) keeps every image the same shape, which matters more for visual consistency than most people expect once photos are placed side by side.</p>

<h2>Cropping vs. resizing</h2>
<p>These solve different problems: cropping removes part of the image to change what's shown, while resizing changes the overall dimensions without cutting anything out. It's common to need both — crop first to get the right composition and aspect ratio, then resize to hit a specific pixel dimension a platform requires.</p>

<p><a href="/image-tools/crop-image">Crop Image</a> supports both freehand and fixed-aspect-ratio cropping directly in your browser. Once cropped, <a href="/image-tools/resize-image">Resize Image</a> can adjust the exact pixel dimensions if a specific size is required.</p>
`,
  },

  {
    slug: "how-to-compress-images",
    title: "How to Compress Images While Keeping Quality",
    description:
      "Shrinking image file sizes without visible quality loss — the settings that actually matter and how to find the right balance.",
    category: "image",
    publishedAt: "2026-05-18",
    readingTime: "4 min read",
    relatedTools: ["compress-image", "resize-image", "convert-image"],
    image: {
      hero: "https://images.unsplash.com/photo-1753164597338-9fe623b2d21c?w=1600&q=80&auto=format&fit=crop",
      thumb: "https://images.unsplash.com/photo-1753164597338-9fe623b2d21c?w=800&q=75&auto=format&fit=crop",
      alt: "Reducing photo file size for faster sharing",
    },
    content: `
<p>Large image files slow down websites, bloat email attachments, and eat into storage limits — and in most cases, they're carrying far more data than the image actually needs for how it's going to be viewed. Compression fixes that, and done properly, the quality loss is barely noticeable.</p>

<h2>Two different kinds of compression</h2>
<p>Lossy compression discards some image data to shrink the file, controlled by a quality setting — more compression means smaller files but more visible artifacts if pushed too far. Lossless compression shrinks the file without discarding any visual data at all, by finding more efficient ways to store the exact same pixels — the savings are smaller, but there's genuinely zero quality tradeoff. Most everyday compression (for JPGs and WEBPs especially) uses the lossy approach, since it delivers much bigger size reductions.</p>

<h2>Finding a quality setting that doesn't look compressed</h2>
<p>Compression artifacts become genuinely visible mainly at low quality settings — blocky patches around sharp edges, color banding in smooth gradients like skies. At moderate-to-high quality settings (roughly 75–90% for JPG-style compression), the size reduction is substantial while artifacts stay essentially invisible at normal viewing sizes. The right setting depends on the image: a busy, detailed photo hides compression better than a smooth gradient or an image with large flat color areas.</p>

<h2>Resizing first often helps more than compressing harder</h2>
<p>If an image is going to be displayed at, say, 800 pixels wide on a website but the original file is 4000 pixels wide, no amount of compression setting-tweaking will be as effective as simply resizing the image down to something closer to its actual display size first. A smaller image compresses more efficiently at any given quality level, so pairing resize with compression usually gets a better result than compression alone.</p>

<h2>Format matters as much as the compression setting</h2>
<p>Compressing a photo that's saved as PNG will save less space than converting it to JPG or WEBP first and compressing that — PNG's lossless design just isn't built for photographic content the way JPG and WEBP are. If a PNG doesn't actually need transparency or pixel-perfect precision, converting format before compressing is often the bigger win.</p>

<p><a href="/image-tools/compress-image">Compress Image</a> handles quality-based compression directly in your browser, letting you compare file sizes at different settings before downloading. If the image is also larger than it needs to be for its destination, <a href="/image-tools/resize-image">Resize Image</a> first will make compression more effective, and <a href="/image-converter/convert-image">the image converter</a> can switch formats if that's the bigger opportunity.</p>
`,
  },

  {
    slug: "how-to-remove-image-background",
    title: "How to Remove an Image Background",
    description:
      "Creating a transparent background from a photo automatically — what makes a background easy or hard to remove cleanly, and how to get the best result.",
    category: "image",
    publishedAt: "2026-05-18",
    readingTime: "4 min read",
    relatedTools: ["remove-background", "watermark-image", "convert-image"],
    image: {
      hero: "https://images.unsplash.com/photo-1753164597338-9fe623b2d21c?w=1600&q=80&auto=format&fit=crop",
      thumb: "https://images.unsplash.com/photo-1753164597338-9fe623b2d21c?w=800&q=75&auto=format&fit=crop",
      alt: "Product photo with background removed for a clean look",
    },
    content: `
<p>A transparent background turns a photo into something that can sit cleanly on top of other content — a product image on a colored page background, a headshot dropped into a design, a logo placed over any color without a visible box around it. What used to require careful manual masking can now be done automatically in seconds for most everyday photos.</p>

<h2>How automatic background removal actually works</h2>
<p>Modern background removal uses a model trained to recognize the boundary between a subject (a person, product, or object) and its surroundings, then generates a precise mask along that boundary and makes everything outside it transparent. It's essentially automating what used to be a slow, manual process of tracing an outline by hand — and for most everyday photos, it gets remarkably close to a clean manual result.</p>

<h2>What makes a background easy to remove cleanly</h2>
<p>High contrast between the subject and the background, clean and simple edges (like a product against a plain backdrop), and good, even lighting all make for the cleanest automatic results. A well-lit product photo on a plain background is close to a best-case scenario for automated removal.</p>

<h2>What makes it harder</h2>
<p>Fine, wispy detail — hair, fur, and thin fabric like tulle or lace — is the hardest thing for any background removal to get pixel-perfect, since the edge itself isn't a clean line. Busy or low-contrast backgrounds (a subject wearing a color close to the background color) also make the boundary harder to detect confidently. These cases still generally work, but are more likely to need a small manual touch-up around the trickiest edges afterward.</p>

<h2>What to do with the result</h2>
<p>Once you have a transparent PNG, it's ready to place over any other background — a solid color, a different photo, or directly onto a design or web page. Since the output needs to preserve transparency, it has to stay in a format that supports an alpha channel (PNG or WEBP); saving it as a JPG afterward would fill the transparent area with a solid color and undo the whole point of removing the background.</p>

<p><a href="/image-tools/remove-background">Remove Background</a> generates a transparent PNG automatically, directly in your browser. If you're preparing product photos and also want a subtle brand mark on them, <a href="/image-tools/watermark-image">Watermark Image</a> can add one after the background is removed.</p>
`,
  },

  {
    slug: "how-to-add-watermarks-to-images",
    title: "How to Add Watermarks to Images",
    description:
      "Protecting photos and designs with a watermark — placement, opacity, and the balance between protection and a usable, presentable image.",
    category: "image",
    publishedAt: "2026-05-25",
    readingTime: "4 min read",
    relatedTools: ["watermark-image", "compress-image"],
    image: {
      hero: "https://images.unsplash.com/photo-1753164597338-9fe623b2d21c?w=1600&q=80&auto=format&fit=crop",
      thumb: "https://images.unsplash.com/photo-1753164597338-9fe623b2d21c?w=800&q=75&auto=format&fit=crop",
      alt: "Photographer preparing images with a watermark",
    },
    content: `
<p>A watermark is a simple, direct way to mark ownership of a photo or design before sharing it somewhere it might get copied or reused without permission — a portfolio preview, a proof sent to a client before final payment, or stock images shared for review. Done well, it protects the image without making it unpleasant to look at.</p>

<h2>Text watermarks vs. logo watermarks</h2>
<p>A text watermark (your name, a copyright notice, or a website URL) is quick to set up and works for almost any use case. A logo or image watermark reinforces brand identity more strongly and looks more intentional in a professional context, at the cost of needing to prepare that logo file (ideally as a transparent PNG) beforehand. Photographers and designers sharing portfolio work often prefer a logo mark; anyone protecting casual or one-off images usually just needs text.</p>

<h2>Placement affects how easy it is to remove</h2>
<p>A watermark placed in an empty corner is the least intrusive to look at, but it's also the easiest to crop out entirely, since removing a small area from one edge doesn't damage the rest of the image. A watermark placed across the center of the image (often at a diagonal, and repeated as a subtle pattern) is much harder to crop away without destroying the image itself — which is why "proof" or preview images that specifically shouldn't be usable until purchased often use this more aggressive placement.</p>

<h2>Getting the opacity right</h2>
<p>A watermark that's too subtle can be edited out or simply ignored; one that's too strong makes the image unpleasant to actually view, which defeats the purpose if you're using it on something meant to be shown to a client or the public. A moderate opacity — visible enough to clearly mark the image, but not so heavy it obscures the actual content — is usually the right balance for anything meant to still be presentable while unprotected fully.</p>

<h2>Batch watermarking</h2>
<p>If you're protecting a whole set of images at once — an event photography gallery, a full product catalog — applying the same watermark consistently across every image (same position, opacity, and size) looks far more professional than watermarks that shift around from one photo to the next.</p>

<p><a href="/image-tools/watermark-image">Watermark Image</a> lets you add text or logo watermarks directly in your browser, with control over placement, size, and opacity. Once watermarked, <a href="/image-tools/compress-image">Compress Image</a> can bring the file size down if you're sharing a large batch of proof images.</p>
`,
  },
];
