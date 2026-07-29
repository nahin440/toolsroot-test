// Blog content registry. Each post is genuine, tool-agnostic-but-relevant content that
// naturally links to specific tools in the registry — the Priority 5 structural gap
// (a /blog section with real content that funnels into tool pages) from the SEO plan.

export const BLOG_POSTS = [
  {
    slug: "jpg-vs-png-vs-webp",
    title: "JPG vs PNG vs WEBP: Which Image Format Should You Actually Use?",
    description:
      "A practical breakdown of when to use JPG, PNG, or WEBP — covering compression, transparency, and real file size differences.",
    category: "image",
    publishedAt: "2026-01-12",
    readingTime: "6 min read",
    relatedTools: ["convert-image", "compress-image"],
    content: `
<p>Every image format makes a different tradeoff between file size, quality, and features, and picking the wrong one is one of the more common (and easily fixed) sources of a slow website or a bloated email attachment. Here's what actually separates the three formats you'll run into most often.</p>

<h2>JPG: the default for photos</h2>
<p>JPG uses lossy compression, meaning it discards some image data to shrink file size, with a quality setting that controls how much. For photographs — where the human eye is forgiving of subtle compression artifacts — JPG usually hits the best size-to-quality balance of the three formats. What JPG can't do is transparency; every JPG has an opaque background, which rules it out for logos or graphics that need to sit cleanly over other content.</p>

<h2>PNG: lossless, with transparency</h2>
<p>PNG is lossless — nothing is discarded, so what you save is pixel-for-pixel identical to the source. That makes it the right choice for screenshots, logos, and graphics with sharp edges or text, where JPG's compression artifacts would visibly blur fine detail. PNG also supports a transparent background (an alpha channel), which is why it's the standard format for logos and icons meant to overlay other content. The tradeoff is file size: a PNG of a complex photo is typically much larger than an equivalent JPG.</p>

<h2>WEBP: modern, and usually the smallest</h2>
<p>WEBP is a newer format that supports both lossy and lossless compression, plus transparency, in one format — effectively covering what JPG and PNG each do separately, usually at a smaller file size than either for equivalent visual quality. The main reason it isn't universal yet is that some older software and a handful of platforms still don't fully support it, though browser and app support has become very broad.</p>

<h2>A simple way to decide</h2>
<p>Photos with no transparency need: JPG for maximum compatibility, or WEBP if the destination supports it and file size matters (like a website's load time). Logos, icons, and anything needing a transparent background: PNG for maximum compatibility, or WEBP again if supported. Screenshots and graphics with sharp text or lines: PNG, since JPG's compression tends to blur fine detail the most in exactly this kind of image.</p>

<p>If you're not sure which will actually end up smaller for a specific image, the fastest way to find out is to try both — <a href="/image-tools/convert-image">Convert Image</a> handles conversion between all three formats (plus several others) in seconds, and <a href="/image-tools/compress-image">Compress Image</a> lets you compare file sizes directly at different quality levels before you commit to one.</p>
`,
  },

  {
    slug: "how-to-reduce-pdf-file-size",
    title: "How to Reduce PDF File Size Without Losing Quality",
    description:
      "Why PDFs get so large in the first place, and the practical steps to shrink one down — without making the text blurry or unreadable.",
    category: "pdf",
    publishedAt: "2026-01-19",
    readingTime: "5 min read",
    relatedTools: ["compress-pdf", "merge-pdf"],
    content: `
<p>A PDF that's too large to email, too slow to upload, or eating unnecessary storage space is one of the most common document annoyances there is — and it's almost always fixable, once you understand why the file got that big in the first place.</p>

<h2>What actually makes a PDF large</h2>
<p>In the vast majority of cases, it's embedded images. A scanned document is effectively one large image per page; a report with high-resolution photos or charts carries that same weight. Text itself takes up very little space, since it's stored as compact vector and font data, not pixels — so a 40-page text-only report is often smaller than a 3-page PDF with a couple of uncompressed photos.</p>

<h2>Why "just re-save it" doesn't always help</h2>
<p>Simply re-exporting a PDF from whatever program created it often doesn't re-compress the images that are already embedded — it just repackages them at their existing resolution. Getting a genuinely smaller file usually means actually re-encoding the embedded images at a lower quality setting, which is a different operation than a plain re-save.</p>

<h2>The quality tradeoff, and why it's usually smaller than you'd think</h2>
<p>Compressing embedded images does trade some visual fidelity for file size — but for most real-world use, that tradeoff is barely noticeable. An image that will only ever be viewed on a screen doesn't need print-resolution detail, and compression artifacts at light-to-medium settings are genuinely hard to spot at normal viewing size. Reserve the lightest compression settings for documents where image quality actually matters, like a design portfolio, and use more aggressive settings for things like scanned paperwork where legibility, not visual fidelity, is what matters.</p>

<h2>A few things worth checking first</h2>
<p>If a PDF was assembled from multiple source files, check whether all of them actually need to be full resolution — a cover page photo probably doesn't need the same fidelity as a technical diagram someone needs to zoom into. If the PDF is a merge of several smaller documents, merging cleanly (rather than, say, printing each page to a new PDF and recombining) avoids adding extra compression generations that degrade quality without saving space.</p>

<p><a href="/pdf-tools/compress-pdf">Compress PDF</a> handles the actual re-encoding step directly in your browser, with a choice of compression levels from light to maximum, showing you the resulting file size before you download. If you're working with several files that need combining first, <a href="/pdf-tools/merge-pdf">Merge PDF</a> can assemble them into one document that you then run through compression as a final step.</p>
`,
  },

  {
    slug: "word-to-pdf-formatting-guide",
    title: "Why Your Word Document Sometimes Looks Different as a PDF (and How to Fix It)",
    description:
      "Understanding why formatting can shift when converting Word to PDF, and how a converter that reads the real document structure avoids the problem.",
    category: "document",
    publishedAt: "2026-01-26",
    readingTime: "5 min read",
    relatedTools: ["word-to-pdf", "pdf-to-word"],
    content: `
<p>Converting a Word document to PDF is meant to lock in exactly how it looks — that's the whole point of PDF as a format. So it's a genuinely frustrating surprise when fonts shift, spacing changes, or a table's borders disappear in the conversion. Here's what's actually going on, and what a conversion tool needs to do to avoid it.</p>

<h2>The real cause: how the converter reads the file</h2>
<p>A DOCX file isn't just "text with some formatting on top" — it's a structured document format (technically, a zipped bundle of XML files known as OOXML) that stores exact font sizes, colors, spacing, and layout as explicit data. A conversion tool that reads this structure directly can reproduce it precisely. A conversion tool that takes a shortcut — extracting rough text and guessing at formatting, or relying on a simplified parsing library that doesn't capture every detail — will drift from the original in exactly the ways people notice: a font substituted for something close-but-not-quite, spacing that's slightly off, or a table that loses its borders.</p>

<h2>What tends to go wrong most often</h2>
<p>Tables are a common casualty — if a converter doesn't fully parse table structure, borders, shading, and cell alignment can be lost even if the text survives. Custom or embedded fonts are another: if a tool falls back to a default font instead of reading the document's actual font specification, text that was meant to look a certain way ends up looking generic. Precise spacing and indentation, especially in documents with specific formatting requirements (like a resume or a legal document), are exactly the kind of fine detail that gets lost when a converter approximates rather than parses.</p>

<h2>What "reads the real structure" looks like in practice</h2>
<p>A conversion tool built to parse the document's actual OOXML data — rather than working from an approximation — carries font size, color, and styling information through per run of text, keeps table formatting intact including borders and shading, and preserves image positioning exactly as placed in the original. The practical result: what you see in Word is what you get in the PDF.</p>

<p><a href="/document-tools/word-to-pdf">Word to PDF</a> is built this way — it parses the DOCX file's real structure directly rather than approximating it, which is why fonts, tables, and layout come through matching the original. Going the other direction, <a href="/document-tools/pdf-to-word">PDF to Word</a> uses the same principle in reverse: real per-run font styling, genuine table detection, and image extraction, rather than dumping flat, unformatted text into a new document.</p>
`,
  },

  {
    slug: "podcast-audio-loudness-normalization",
    title: "Why Podcast Episodes Sound Inconsistent (and How Loudness Normalization Fixes It)",
    description:
      "Listeners reaching for the volume knob between episodes usually means one thing: inconsistent loudness. Here's what normalization actually does about it.",
    category: "audio",
    publishedAt: "2026-02-02",
    readingTime: "4 min read",
    relatedTools: ["normalize-audio", "trim-audio"],
    content: `
<p>If listeners keep reaching for the volume knob between episodes, or one segment sounds noticeably quieter than the intro, the underlying issue is almost always inconsistent loudness — and it's one of the more fixable problems in audio production, once you understand what's actually happening.</p>

<h2>Why loudness drifts in the first place</h2>
<p>Recording setups vary — different microphones, different room acoustics, different distances from the mic — and even a single recording session can drift in volume as a speaker leans in or sits back. Combine clips from different sources (a co-host recorded remotely, an inserted sound clip, an intro recorded separately) and the loudness differences compound further. None of this is really avoidable at the recording stage; it's a normal part of how audio gets captured.</p>

<h2>What normalization actually does</h2>
<p>Loudness normalization analyzes an audio file and adjusts its overall level to reach a consistent target loudness — as opposed to simply multiplying the volume by a fixed amount, which is a much blunter approach that risks pushing an already-loud section into clipping (harsh, distorted audio from a signal that's too strong). Targeting a specific loudness level, rather than just "louder," is the same general approach professional audio and podcast platforms use to keep episodes sounding consistent with each other.</p>

<h2>What normalization won't fix</h2>
<p>It's worth being clear-eyed about the limits: normalization addresses a file's overall loudness, not moment-to-moment volume swings within a single recording. A conversation where one speaker is consistently much quieter than another throughout the whole episode is a mixing problem that benefits from separate track-level adjustment, not something a single normalization pass alone fully resolves. Where normalization shines is bringing separate files or episodes into a consistent overall ballpark with each other.</p>

<h2>A simple pre-publishing routine</h2>
<p>Trim any dead air or false starts first, since silence at the edges can skew how a loudness analysis reads the file. Then normalize each episode (or each source clip before combining them) to a consistent target. If you're combining separately recorded segments — an intro, an interview, an outro — normalizing each before merging tends to produce a cleaner result than normalizing only after they're already combined.</p>

<p><a href="/audio-tools/trim-audio">Trim Audio</a> handles cutting silence or dead air from the start and end of a recording with a visual waveform for precise editing, and <a href="/audio-tools/normalize-audio">Normalize Audio</a> brings the result to a consistent target loudness — both running directly in your browser without uploading the recording anywhere.</p>
`,
  },

  {
    slug: "compress-video-without-losing-quality",
    title: "How to Compress a Video Without It Looking Terrible",
    description:
      "The relationship between bitrate, resolution, and visible quality — and how to find the smallest file size that still looks good.",
    category: "video",
    publishedAt: "2026-02-09",
    readingTime: "5 min read",
    relatedTools: ["compress-video", "resize-video"],
    content: `
<p>Every video compression tool asks you to trade file size against quality, but "how much" isn't obvious until you understand what's actually happening when a video gets smaller — and why some compressed videos look fine while others look like a blurry mess.</p>

<h2>Bitrate is doing most of the work</h2>
<p>Bitrate is roughly how much data is used to encode each second of video. A higher bitrate preserves more visual detail, especially in fast motion or complex scenes; a lower bitrate saves space but can introduce visible blockiness or blur, particularly wherever there's a lot of movement or fine detail (like grass, water, or a busy background) that's hard to compress efficiently. Bitrate is the single biggest lever for balancing file size against quality — more so than which specific format you export to.</p>

<h2>Resolution matters too, but differently</h2>
<p>Reducing a video's actual pixel dimensions (say, from 4K down to 1080p) also shrinks file size, but through a different mechanism — there's simply less pixel data to encode per frame, at any bitrate. This is a genuinely different tool than lowering bitrate at a fixed resolution: reducing resolution can produce a cleaner-looking result at a given file size than keeping full resolution and just squeezing the bitrate down hard, especially if the video will only ever be viewed at a smaller size anyway (like inside a chat app or a small embedded player).</p>

<h2>Where compression struggles most</h2>
<p>Fast motion, fine textures, and low-light footage with visible grain are the hardest content for any compressor to handle efficiently — they contain a lot of per-frame detail that changes constantly. A mostly static talking-head video compresses far more gracefully than, say, handheld action footage, which is worth keeping in mind when deciding how aggressively to compress a specific clip.</p>

<h2>A practical approach</h2>
<p>Start by asking where the video will actually be watched — a video destined for a small in-app player doesn't need the same bitrate as one meant for a large screen. If you're aiming for a specific size limit (an upload cap, an attachment limit), it's often more effective to reduce resolution somewhat and keep a reasonable bitrate than to keep full resolution and crush the bitrate down to hit the same target — the former tends to look cleaner at an equivalent final file size.</p>

<p><a href="/video-tools/compress-video">Compress Video</a> gives direct control over quality and bitrate with a live before/after size comparison, and <a href="/video-tools/resize-video">Resize Video</a> handles the resolution side if you want to combine both approaches — both running on a real FFmpeg engine entirely in your browser.</p>
`,
  },

  {
    slug: "zip-vs-7z-vs-rar-archive-formats",
    title: "ZIP vs 7Z vs RAR: What's Actually Different Between Archive Formats",
    description:
      "Compression ratio, compatibility, and why you can extract a RAR file but not create one on most tools — including this one.",
    category: "archive",
    publishedAt: "2026-02-16",
    readingTime: "4 min read",
    relatedTools: ["create-archive", "extract-archive"],
    content: `
<p>ZIP, 7Z, and RAR all do fundamentally the same job — bundling and compressing files — but they differ in compression efficiency, compatibility, and, in RAR's case, who's actually allowed to create one.</p>

<h2>ZIP: the universal default</h2>
<p>ZIP is the oldest and most broadly supported of the three — every major operating system can open a ZIP file natively, with no extra software required. Its compression isn't the most space-efficient available, but for everyday use — sending a folder of documents, bundling a few files for upload — that gap rarely matters, and universal compatibility is usually worth more than a marginally smaller file.</p>

<h2>7Z: better compression, less universal</h2>
<p>7Z (7-Zip's native format) generally achieves stronger compression than ZIP, meaning a smaller resulting file for the same content — useful when you're archiving something large, like a folder of high-resolution images or a big project directory. The tradeoff is that not every operating system opens 7Z natively; some systems need dedicated software installed first, which makes it a better choice when you control both ends of the exchange (archiving your own backups, for instance) than when sending a file to someone whose setup you don't know.</p>

<h2>RAR: why you can open one but not make one</h2>
<p>RAR is a proprietary format owned by WinRAR — and that's the specific reason RAR creation isn't available in most tools, including this one: only WinRAR's own software is licensed to create RAR archives. Reading and extracting RAR files is a different matter and is broadly supported, since the format's read specification is more widely implemented. In practice, this means you'll regularly need to open a RAR archive someone else sent you, but if you need to create a compressed archive yourself, ZIP, 7Z, or a similar open format is what's actually available to you.</p>

<h2>TAR and GZ: common outside Windows and Mac</h2>
<p>TAR and GZ (often combined as TAR.GZ) are the standard archive formats in Unix and Linux environments, including most software distributed for those systems. TAR itself just bundles files together without compressing them; GZ compression is typically applied on top. If you're working in a Linux-centric environment or downloading open-source software, these are the formats you'll run into most.</p>

<h2>Which one should you actually use?</h2>
<p>For sending files to someone else: ZIP, since you can be confident they'll be able to open it without installing anything extra. For your own storage or backups where you control both ends: 7Z, for the smaller resulting file size. For opening something someone sent you: whatever format it arrived in — extraction tools generally handle all of them, RAR included.</p>

<p><a href="/archive-tools/create-archive">Create Archive</a> builds ZIP, 7Z, TAR, or GZ archives using a real 7-Zip engine compiled to run in your browser, and <a href="/archive-tools/extract-archive">Extract Archive</a> opens any of those plus RAR files, letting you browse and pull out individual files without extracting everything at once.</p>
`,
  },
];

export function getBlogPost(slug) {
  return BLOG_POSTS.find((post) => post.slug === slug) || null;
}

export function getAllBlogSlugs() {
  return BLOG_POSTS.map((post) => post.slug);
}

export function getRelatedBlogPosts(slug, limit = 3) {
  const post = getBlogPost(slug);
  if (!post) return [];
  return BLOG_POSTS.filter((p) => p.category === post.category && p.slug !== slug).slice(0, limit);
}
