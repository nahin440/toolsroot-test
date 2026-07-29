import { getTool } from "./tools";

const GENERIC_PRIVACY_FAQ = {
  question: "Is my file uploaded to a server?",
  answer:
    "No. Every operation on this page runs locally in your browser using JavaScript and WebAssembly. Your file is never transmitted anywhere, which also means it works without an internet connection once the page has loaded.",
};

// Full, tool-specific SEO content for every tool in the registry: how-it-works steps,
// an 6-8 question FAQ, and a long-form description with proper H2 heading structure
// (why use it / how it works / common use cases) for search engines and readers.
const OVERRIDES = {
  "change-video-fps": {
    howItWorks: {
      title: "How to change a video's frame rate",
      steps: [
        "Upload your video file.",
        "Choose your target frame rate (fps).",
        "The tool re-encodes the video at the new frame rate.",
        "Download your video with the updated frame rate.",
      ],
    },
    faq: [
      {
        question: "What is frame rate (fps) and why would I want to change it?",
        answer:
          "Frame rate is how many individual images (frames) make up one second of video. Common reasons to change it include matching a platform's requirements, reducing file size by lowering fps, or converting footage to match another video's frame rate before combining them.",
      },
      {
        question: "Will lowering the frame rate make the video look choppier?",
        answer:
          "Reducing fps means fewer frames per second are shown, which can make fast motion look less smooth, especially at very low frame rates — the effect is more noticeable in action-heavy footage than in mostly-static content like a talking-head video.",
      },
      {
        question: "Can I increase the frame rate above what the original video was recorded at?",
        answer:
          "Yes, though this involves generating additional frames rather than capturing genuinely new motion detail, since the source footage doesn't contain more temporal information than it was originally recorded with.",
      },
      {
        question: "Does changing frame rate affect video length or audio sync?",
        answer:
          "The tool is built to adjust frame rate while keeping the video's duration and audio synchronization intact.",
      },
      {
        question: "What are common frame rate targets?",
        answer:
          "24fps is standard for a cinematic look, 30fps is common for general video and broadcast, and 60fps is often used for smooth motion in sports or gaming footage — the right target depends on your intended use.",
      },
      {
        question: "Is my video uploaded to a server?",
        answer:
          "No. Every operation runs locally in your browser using a real FFmpeg engine compiled to WebAssembly. Your video is never transmitted anywhere.",
      },
    ],
    longDescription: "<h2>Why change video frame rate with Tools Root</h2><p>Frame rate mismatches cause real problems — combining footage from two different cameras with different fps, meeting a specific platform's technical requirements, or reducing file size by lowering an unnecessarily high frame rate for content that doesn't need it.</p><h2>Real re-encoding, duration and sync preserved</h2><p>Changing frame rate through actual re-encoding, rather than simply relabeling metadata, means the output genuinely plays at the new frame rate while keeping the video's length and audio synchronization correct.</p><h2>Common use cases</h2><p>Matching frame rates between clips from different cameras before editing them together, reducing an unnecessarily high frame rate to save file size, converting footage to a cinematic 24fps look, or meeting a specific platform's frame rate requirement for upload.</p>",
  },
  "compress-image": {
    howItWorks: {
      title: "How to compress an image",
      steps: [
        "Upload one or more images (batch compression is supported).",
        "Choose a quality level, from near-lossless to maximum compression.",
        "Compare the before/after file size shown live as you adjust.",
        "Download the compressed image, or all of them as a ZIP.",
      ],
    },
    faq: [
      {
        question: "How much smaller will my image get?",
        answer:
          "It varies by image content and starting format — photos with a lot of fine detail compress less dramatically than simpler images, and a source image that's already compressed (like an existing JPG) has less room to shrink further than an uncompressed source like a PNG straight from a camera.",
      },
      {
        question: "Can I compress many images at once with the same settings?",
        answer:
          "Yes, batch compression applies your chosen quality setting to every uploaded image at once, useful for shrinking a whole folder of photos before uploading them somewhere.",
      },
      {
        question: "Will compression be visibly noticeable?",
        answer:
          "At light-to-medium compression, quality loss is usually hard to spot on screen. Higher compression trades more visible quality for a smaller file — the live preview lets you see the tradeoff before committing.",
      },
      {
        question: "What's the difference between this and just re-saving as a lower-quality JPG?",
        answer:
          "This tool supports quality-adjustable compression across multiple formats (not just JPG), and lets you compare file size in real time as you adjust, rather than guessing and re-exporting repeatedly.",
      },
      {
        question: "Does compressing an image change its dimensions?",
        answer:
          "No, compression reduces file size by changing how pixel data is encoded, not by resizing the image — width and height stay the same. Use Resize Image if you also want to shrink dimensions.",
      },
      {
        question: "Which formats can be compressed?",
        answer:
          "JPG, PNG, WEBP, BMP, and AVIF are all compressed while staying in their original format. GIF, TIFF, SVG, ICO, and HEIC don't have an adjustable-quality setting of their own to compress along, so uploading one of those converts it to JPG instead — a real format change, not just a smaller version of the original file.",
      },
      {
        question: "Is my image uploaded to a server?",
        answer:
          "No. Every operation runs locally in your browser using JavaScript and WebAssembly. Your image is never transmitted anywhere, which also means it works without an internet connection once the page has loaded.",
      },
    ],
    longDescription: "<h2>Why compress images with Tools Root</h2><p>Large image files slow down websites, eat into email attachment limits, and take up storage space unnecessarily — often without any visible quality benefit, since most images are viewed on screens far lower resolution than the source file. Compression closes that gap.</p><h2>Quality-adjustable, with a live preview</h2><p>Rather than a single fixed compression level, you choose exactly how much to trade file size for visual fidelity, watching the resulting size update as you adjust — useful for finding the smallest file that still looks good for your specific use.</p><h2>Common use cases</h2><p>Shrinking product photos before uploading to an online store, compressing a batch of photos to fit under an email attachment limit, reducing image weight to speed up a website's load time, or preparing images for a platform with a strict file size cap.</p>",
  },
  "compress-pdf": {
    howItWorks: {
      title: "How to compress a PDF",
      steps: [
        "Upload the PDF you want to shrink.",
        "Choose a compression level, from light (best quality) to maximum (smallest file).",
        "The tool re-encodes embedded images and optimizes internal fonts and structure.",
        "Download the smaller PDF and compare the before/after file size shown on screen.",
      ],
    },
    faq: [
      {
        question: "How much smaller will my PDF get?",
        answer:
          "It depends heavily on what's inside the file. PDFs with large, high-resolution embedded images typically shrink the most — sometimes 60-90% — since image data is usually the biggest contributor to file size. A PDF that's mostly text was probably already small and won't shrink as dramatically.",
      },
      {
        question: "Will compression make my PDF blurry?",
        answer:
          "At light and medium settings, image quality loss is generally hard to notice on screen. Maximum compression trades more visible quality for a smaller file, which is useful when file size matters more than print-level image fidelity, like for email attachments.",
      },
      {
        question: "Does compression affect the text, or only images?",
        answer:
          "Text stays fully selectable and sharp at any compression level — this tool only re-encodes embedded raster images and optimizes font subsetting and internal PDF structure. Text is vector data, not pixels, so it isn't degraded by compression the way images are.",
      },
      {
        question: "Can I compress a scanned PDF made entirely of images?",
        answer:
          "Yes, and scanned PDFs are often where compression makes the biggest difference, since every page is effectively one large image.",
      },
      {
        question: "Will compressing remove any pages or content?",
        answer:
          "No. Compression only changes how existing content is encoded — every page, image, and piece of text in the original remains in the output, just stored more efficiently.",
      },
      {
        question: "What's a realistic target if I need to get under an email attachment limit?",
        answer:
          "Try medium or maximum compression first and check the resulting size shown on screen; if it's still too large, the file likely has very high-resolution source images and may need pages split across multiple emails instead.",
      },
      {
        question: "Can I undo compression if I don't like the result?",
        answer:
          "Since your original file never leaves your device, it's untouched on your computer — just re-upload it and try a lighter compression setting if the first result isn't what you wanted.",
      },
      {
        question: "Is my file uploaded to a server?",
        answer:
          "No. Every operation on this page runs locally in your browser using JavaScript and WebAssembly. Your file is never transmitted anywhere, which also means it works without an internet connection once the page has loaded.",
      },
    ],
    longDescription: "<h2>Why compress PDFs with Tools Root</h2><p>PDFs balloon in size mainly because of embedded images saved at unnecessarily high resolution, or fonts and metadata that don't need to be duplicated throughout the file. Compression targets exactly that — the visual content and structure stay intact, but the file takes up less space and uploads or emails faster.</p><h2>What actually happens during compression</h2><p>This tool re-encodes embedded raster images at a quality level you choose, and optimizes internal PDF structure like font subsetting and object streams. It does not rasterize your text into images, which is a shortcut some compressors use that makes text blurry and unselectable — text here stays exactly as sharp and searchable as the original.</p><h2>Common use cases</h2><p>Getting a scanned document under an email attachment size limit, shrinking a design portfolio PDF for faster web download, reducing storage costs for a large archive of digitized paperwork, or preparing a file for a web form that enforces a maximum upload size.</p>",
  },
  "compress-video": {
    howItWorks: {
      title: "How to compress a video",
      steps: [
        "Upload your video file.",
        "Set a target quality level and bitrate.",
        "The tool re-encodes the video to reduce file size.",
        "Download the compressed video and compare the before/after size.",
      ],
    },
    faq: [
      {
        question: "How much smaller will my video get?",
        answer:
          "It depends heavily on the source video's original bitrate and resolution — a video exported at a very high bitrate has much more room to shrink than one that was already efficiently compressed.",
      },
      {
        question: "Will compression make my video look noticeably worse?",
        answer:
          "At moderate compression settings, quality loss is often hard to notice, especially on smaller screens. More aggressive compression trades more visible quality for a smaller file — you control where on that spectrum to land via the quality and bitrate settings.",
      },
      {
        question: "Can I set a specific target bitrate?",
        answer:
          "Yes, bitrate is configurable directly, which is useful if you have a specific file size target in mind, such as fitting under a platform's upload limit.",
      },
      {
        question: "Does compression affect video resolution?",
        answer:
          "Compression primarily affects how efficiently each frame is encoded rather than the pixel dimensions — use Resize Video alongside compression if you also want to reduce resolution for an even smaller file.",
      },
      {
        question: "How long does compressing a video take?",
        answer:
          "Processing time depends on your video's length and resolution and your device's processing power, since re-encoding happens entirely on your own hardware.",
      },
      {
        question: "Is my video uploaded to a server?",
        answer:
          "No. Every operation runs locally in your browser using a real FFmpeg engine compiled to WebAssembly. Your video is never transmitted anywhere.",
      },
    ],
    longDescription: "<h2>Why compress video with Tools Root</h2><p>Large video files are slow to upload, eat storage space, and often exceed platform size limits — frequently without any real visual benefit, since the source bitrate may be far higher than needed for how the video will actually be viewed.</p><h2>Configurable quality and bitrate, real encoding</h2><p>Rather than one fixed compression level, quality and bitrate are both adjustable, letting you target a specific balance between file size and visual fidelity using a genuine FFmpeg encoding pipeline running on your own device.</p><h2>Common use cases</h2><p>Shrinking a video to fit under a social media platform's upload size limit, compressing a screen recording before sharing it over email, reducing file size for faster cloud storage uploads, or preparing a large video file for a messaging app with strict size limits.</p>",
  },
  "convert-audio": {
    howItWorks: {
      title: "How to convert an audio file",
      steps: [
        "Upload your audio file.",
        "Choose your target format: MP3, WAV, AAC, FLAC, OGG, M4A, AIFF, or AMR.",
        "Adjust bitrate settings if converting to a compressed format.",
        "Download your converted audio file.",
      ],
    },
    faq: [
      {
        question: "Which audio formats are supported?",
        answer:
          "Conversion between MP3, WAV, AAC, FLAC, OGG, M4A, AIFF, and AMR is supported, covering the most common compressed and uncompressed audio formats.",
      },
      {
        question: "What's the difference between lossy and lossless formats here?",
        answer:
          "FLAC, WAV, and AIFF are lossless — no audio data is discarded. MP3, AAC, OGG, and AMR are lossy, meaning some audio data is discarded to reduce file size, with quality controlled by the bitrate you choose.",
      },
      {
        question: "Will converting from a lossy format to a lossless one restore lost quality?",
        answer:
          "No, converting MP3 to FLAC, for example, doesn't recover audio data that was already discarded during the original MP3 encoding — the file will be larger but won't sound better than the source MP3.",
      },
      {
        question: "What bitrate should I choose for MP3 or AAC output?",
        answer:
          "Higher bitrates preserve more audio detail at the cost of a larger file; typical speech content can sound fine at lower bitrates, while music generally benefits from a higher bitrate to avoid noticeable compression artifacts.",
      },
      {
        question: "Does this use a real audio processing engine?",
        answer:
          "Yes, conversion runs on a real FFmpeg build compiled to WebAssembly — the same underlying engine widely used in professional audio and video tools — running entirely on your device.",
      },
      {
        question: "Is my file uploaded to a server?",
        answer:
          "No. Every operation runs locally in your browser using a real FFmpeg engine compiled to WebAssembly. Your file is never transmitted anywhere.",
      },
    ],
    longDescription: "<h2>Why convert audio with Tools Root</h2><p>Different devices, platforms, and software expect different audio formats — a podcast platform wants MP3, an audio engineer wants lossless WAV, an older device only plays AMR. Converting gets your file into whatever format the destination actually needs.</p><h2>A real FFmpeg engine, running on your device</h2><p>Audio processing uses a genuine FFmpeg build compiled to WebAssembly, the same engine used by professional audio and video software, rather than a simplified reimplementation. This means format support and conversion quality match what you'd get from installed desktop software.</p><h2>Common use cases</h2><p>Converting a WAV recording to MP3 for smaller file size before sharing, converting AAC voice memos to a more universally compatible format, preparing a lossless FLAC file for a platform that requires MP3, or converting AMR voicemail recordings into a format that plays on more devices.</p>",
  },
  "convert-image": {
    howItWorks: {
      title: "How to convert an image",
      steps: [
        "Drag and drop one or more images (you can convert several at once).",
        "Choose your target format: PNG, JPG, WEBP, AVIF, BMP, TIFF, GIF, SVG, ICO, or HEIC.",
        "Adjust quality settings if converting to a lossy format.",
        "Download your converted image, or all of them together as a ZIP.",
      ],
    },
    faq: [
      {
        question: "Which image formats are supported?",
        answer:
          "Conversion between PNG, JPG, WEBP, AVIF, BMP, TIFF, GIF, SVG, ICO, and HEIC is supported, covering nearly every common image format you'll encounter.",
      },
      {
        question: "Can I convert multiple images to the same format at once?",
        answer:
          "Yes, batch conversion is supported — upload several images, pick one target format, and they'll all convert together, downloadable individually or as a single ZIP.",
      },
      {
        question: "Will converting between formats reduce image quality?",
        answer:
          "It depends on the formats involved. Converting between lossless formats (like PNG to BMP) preserves quality exactly. Converting to a lossy format (like JPG or WEBP) involves a quality setting you control — higher quality means larger files with less compression artifacting.",
      },
      {
        question: "Why would I convert a PNG to WEBP or AVIF?",
        answer:
          "WEBP and AVIF are newer formats that typically produce meaningfully smaller file sizes than PNG or JPG at equivalent visual quality, which is useful for web pages where load time matters.",
      },
      {
        question: "Can I convert HEIC photos from an iPhone to something more universally supported?",
        answer:
          "Yes, HEIC (the default format on recent iPhones) converts to JPG, PNG, or any other supported format, which is useful since HEIC isn't universally supported by older software or non-Apple devices.",
      },
      {
        question: "Does converting a PNG with transparency to JPG cause problems?",
        answer:
          "JPG doesn't support transparency, so converting a transparent PNG to JPG fills the transparent areas with a solid background color, typically white. If you need to keep transparency, convert to WEBP, PNG, or another format that supports an alpha channel instead.",
      },
      {
        question: "Is there a file size limit for conversion?",
        answer:
          "No hard limit is enforced by the tool. Very large images or large batches are only bounded by your device's available memory, since conversion happens entirely in your browser.",
      },
      {
        question: "Is my image uploaded to a server?",
        answer:
          "No. Every conversion runs locally in your browser using JavaScript and WebAssembly. Your image is never transmitted anywhere, which also means it works without an internet connection once the page has loaded.",
      },
    ],
    longDescription: "<h2>Why convert images with Tools Root</h2><p>Different platforms, software, and use cases expect different image formats — a website wants WEBP for speed, an old application only accepts BMP, a printer wants TIFF, and an iPhone photo defaults to HEIC that many apps still don't recognize. This tool converts between all of them without installing anything.</p><h2>Batch conversion, real format support</h2><p>Converting many images to one target format at once means you're not repeating the same steps file by file. Every supported format is genuinely handled — including less common ones like TIFF and ICO — rather than only covering the handful of formats most converters bother with.</p><h2>Common use cases</h2><p>Converting iPhone HEIC photos to JPG for compatibility with older software, converting a batch of PNGs to WEBP to speed up a website, turning a scanned TIFF into a PDF-friendly format, or generating an ICO file from a logo for use as a website favicon.</p>",
  },
  "convert-image-to-pdf": {
    howItWorks: {
      title: "How to convert images to PDF",
      steps: [
        "Upload one or more images.",
        "Reorder them into the sequence you want them to appear as pages.",
        "Choose page orientation and margin settings.",
        "Download a single PDF containing all your images as pages.",
      ],
    },
    faq: [
      {
        question: "Can I combine multiple images into one PDF?",
        answer:
          "Yes, upload several images and they'll become sequential pages in a single PDF, in whatever order you arrange them.",
      },
      {
        question: "Can I mix different image formats in one PDF?",
        answer:
          "Yes, you can combine JPGs, PNGs, and other supported formats together — each is placed on its own page regardless of its original format.",
      },
      {
        question: "Can I control the page orientation and margins?",
        answer:
          "Yes, choose portrait or landscape orientation and adjust margins so images fit the page the way you want, rather than being forced into a fixed layout.",
      },
      {
        question: "What happens if my images have different dimensions or aspect ratios?",
        answer:
          "Each image is placed on its own page and fitted according to your orientation and margin settings — mismatched aspect ratios across images don't cause a problem since each page is sized independently.",
      },
      {
        question: "Does converting to PDF reduce image quality?",
        answer:
          "Images are embedded at their original resolution and quality — this tool doesn't recompress them beyond what's needed to place them on a PDF page.",
      },
      {
        question: "Is my image uploaded to a server?",
        answer:
          "No. Every operation runs locally in your browser using JavaScript and WebAssembly. Your images are never transmitted anywhere, which also means it works without an internet connection once the page has loaded.",
      },
    ],
    longDescription: "<h2>Why convert images to PDF with Tools Root</h2><p>A PDF is often the expected format for submitting scanned documents, sharing a set of photos as one file, or archiving images in a format that opens consistently everywhere. This tool builds a proper multi-page PDF directly from your images.</p><h2>Full control over page order and layout</h2><p>Reordering images before conversion means the resulting PDF reads in the sequence you intend, and independent orientation and margin controls mean a mix of portrait and landscape source photos can still produce a clean, consistent document.</p><h2>Common use cases</h2><p>Combining photos of a multi-page paper document into a single scanned PDF, turning a set of receipt photos into one file for expense reporting, assembling a photo portfolio into a shareable PDF, or converting screenshots into a PDF for easier printing or filing.</p>",
  },
  "convert-video": {
    howItWorks: {
      title: "How to convert a video",
      steps: [
        "Upload your video file.",
        "Choose your target format: MP4, AVI, MOV, MKV, WEBM, or animated GIF.",
        "Adjust quality settings if needed.",
        "Download your converted video.",
      ],
    },
    faq: [
      {
        question: "Which video formats are supported?",
        answer:
          "Conversion between MP4, AVI, MOV, MKV, WEBM, and animated GIF is supported, covering the most common video container formats.",
      },
      {
        question: "Can I convert a video to an animated GIF?",
        answer:
          "Yes, GIF conversion is supported, useful for creating short, silent, looping clips for messaging or web use where a full video player isn't practical.",
      },
      {
        question: "Will converting affect video quality?",
        answer:
          "Converting between formats generally preserves quality well, though the exact result depends on the codecs and quality settings involved for the target format — you have control over quality settings where the target format supports it.",
      },
      {
        question: "How long does conversion take?",
        answer:
          "Processing time depends on video length, resolution, and your device's processing power, since conversion happens entirely on your own hardware rather than a shared server.",
      },
      {
        question: "Does this use a real video processing engine?",
        answer:
          "Yes, conversion runs on a real FFmpeg build compiled to WebAssembly — the same underlying engine used by professional video software — running entirely on your device rather than a server.",
      },
      {
        question: "Is my video uploaded to a server?",
        answer:
          "No. Every operation runs locally in your browser using a real FFmpeg engine compiled to WebAssembly. Your video is never transmitted anywhere.",
      },
    ],
    longDescription: "<h2>Why convert video with Tools Root</h2><p>Different platforms and devices support different video formats — a website wants MP4 or WEBM, an older device might need AVI, and a quick shareable clip might work best as an animated GIF. Converting gets your file into whatever format actually plays where you need it to.</p><h2>A real FFmpeg engine, not a lightweight approximation</h2><p>Video processing uses a genuine FFmpeg build compiled to WebAssembly, the same engine that underlies much of the professional video tooling world, running entirely in your browser tab. That means real codec support and quality, without needing to install anything or upload your video anywhere.</p><h2>Common use cases</h2><p>Converting a MOV file from an iPhone to MP4 for broader compatibility, turning a short clip into a GIF for messaging, converting an old AVI file to a modern format for easier playback, or preparing a video in WEBM for faster website loading.</p>",
  },
  "create-archive": {
    howItWorks: {
      title: "How to create an archive",
      steps: [
        "Upload one or more files, or an entire folder.",
        "Choose your archive format: ZIP, 7Z, TAR, or GZ.",
        "Set a compression level if the format supports it.",
        "Download your compressed archive.",
      ],
    },
    faq: [
      {
        question: "Can I create a RAR archive?",
        answer:
          "No — RAR is a proprietary format, and only WinRAR's own software can create RAR files; every other tool, including this one, can only extract them. You can create ZIP, 7Z, TAR, or GZ archives here, all of which are open formats.",
      },
      {
        question: "Can I archive multiple files and folders together?",
        answer:
          "Yes, select as many files as you need and they'll be bundled into a single archive, preserving their relative structure.",
      },
      {
        question: "Which format should I choose?",
        answer:
          "ZIP is the most universally compatible choice and opens natively on nearly every operating system without extra software. 7Z typically achieves stronger compression for a smaller file at the cost of needing dedicated software to open on some systems. TAR and GZ are common in Unix and Linux environments.",
      },
      {
        question: "Is there a limit on file size or number of files?",
        answer:
          "No hard limit is enforced by the tool. Very large archives are only bounded by your device's available memory, since compression happens entirely in your browser.",
      },
      {
        question: "Does compressing files into an archive reduce their quality?",
        answer:
          "No, standard archive compression is lossless — every file's exact original data is preserved and can be extracted back out unchanged, regardless of the archive format.",
      },
      {
        question: "Is my file uploaded to a server?",
        answer:
          "No. Archive creation runs entirely in your browser using a real compiled compression engine. Your files are never transmitted anywhere.",
      },
    ],
    longDescription: "<h2>Why create archives with Tools Root</h2><p>Bundling multiple files into one compressed archive makes sharing, uploading, and storing them far more manageable than handling dozens of individual files — and compression shrinks the total size in the process.</p><h2>A real 7-Zip engine, not a reimplementation</h2><p>Archive creation runs on the actual 7-Zip binary compiled to WebAssembly, rather than a simplified reimplementation of the compression algorithm — meaning genuine, standards-compliant ZIP, 7Z, TAR, and GZ output that opens correctly in any standard archive tool.</p><h2>Common use cases</h2><p>Bundling a project's files into one ZIP before sending them to a colleague, compressing a folder of photos to save storage space, archiving old files for long-term backup, or packaging multiple documents together for a single upload where only one file is allowed.</p>",
  },
  "crop-image": {
    howItWorks: {
      title: "How to crop an image",
      steps: [
        "Upload your image.",
        "Drag the crop boundary freely, or snap it to a preset aspect ratio like 1:1 or 16:9.",
        "Reposition and resize the selection until the preview looks right.",
        "Download the cropped image.",
      ],
    },
    faq: [
      {
        question: "Can I crop to a specific aspect ratio, like square for a profile photo?",
        answer:
          "Yes, common preset ratios like 1:1 (square), 4:3, 16:9, and others are available, alongside fully freeform cropping if you don't need a specific ratio.",
      },
      {
        question: "Can I reposition the crop area after drawing it?",
        answer:
          "Yes, drag the selection to reposition it and drag its edges or corners to resize it, all with a live preview of exactly what will be kept.",
      },
      {
        question: "Does cropping reduce image quality?",
        answer:
          "No, the kept portion of the image retains its original pixel data and resolution exactly — cropping only removes the parts outside your selection, it doesn't recompress or degrade what remains.",
      },
      {
        question: "What's the difference between cropping and resizing?",
        answer:
          "Cropping removes part of the image to change what's shown, keeping the remaining area at its original resolution. Resizing keeps the whole image but changes its overall dimensions by scaling. Combine both if you need a specific final size after removing unwanted parts of the frame.",
      },
      {
        question: "Can I crop a transparent PNG without losing transparency?",
        answer:
          "Yes, transparency is preserved in the cropped output for formats that support it.",
      },
      {
        question: "Is my image uploaded to a server?",
        answer:
          "No. Every operation runs locally in your browser using JavaScript and WebAssembly. Your image is never transmitted anywhere, which also means it works without an internet connection once the page has loaded.",
      },
    ],
    longDescription: "<h2>Why crop images with Tools Root</h2><p>Removing distracting background elements, focusing attention on a subject, or fitting a photo to a platform's required aspect ratio are all routine parts of preparing an image, whether for social media, a website, or a document.</p><h2>Freeform or locked to a preset ratio</h2><p>Snapping to a standard ratio like square or 16:9 takes the guesswork out of preparing images for platforms with specific requirements, while freeform cropping covers everything else with full manual control over the exact selection.</p><h2>Common use cases</h2><p>Cropping a photo to a square for a profile picture, trimming a screenshot down to just the relevant portion, cropping a wide photo to a 16:9 ratio for a video thumbnail, or removing an unwanted person or object from the edge of a photo's frame.</p>",
  },
  "crop-pdf": {
    howItWorks: {
      title: "How to crop a PDF",
      steps: [
        "Upload your PDF.",
        "Drag the crop boundary on the page preview, or use auto-detect to trim whitespace automatically.",
        "Apply the same crop to every page, or adjust page by page.",
        "Download the cropped PDF.",
      ],
    },
    faq: [
      {
        question: "Can cropping detect and remove whitespace automatically?",
        answer:
          "Yes, an auto-detect option scans each page for its actual content boundary and trims excess margin automatically, which is faster than manually dragging a crop box on every page.",
      },
      {
        question: "Can I apply a different crop to different pages?",
        answer:
          "Yes, you're not limited to one uniform crop for the whole document — adjust the boundary per page if some pages need different trimming than others.",
      },
      {
        question: "Does cropping delete the trimmed content permanently, or just hide it?",
        answer:
          "This tool adjusts the page's visible boundary using standard PDF crop-box behavior. The result displays and prints as cropped in standard viewers.",
      },
      {
        question: "Will cropping affect text selection or searchability?",
        answer:
          "No, text within the visible cropped area remains fully selectable and searchable — cropping only changes what's visible, not how the underlying content is stored.",
      },
      {
        question: "Can I crop a scanned PDF the same way as a text-based one?",
        answer:
          "Yes, both auto-detect and manual cropping work on scanned image content the same way they work on text and vector graphics.",
      },
      {
        question: "Is my file uploaded to a server?",
        answer:
          "No. Every operation on this page runs locally in your browser using JavaScript and WebAssembly. Your file is never transmitted anywhere, which also means it works without an internet connection once the page has loaded.",
      },
    ],
    longDescription: "<h2>Why crop PDFs with Tools Root</h2><p>Documents scanned with an oversized margin, exported with excess white space, or combined from sources with mismatched page sizes often need trimming to look clean and consistent. Cropping fixes this without needing to reprint or rescan anything.</p><h2>Auto-detect or manual, page by page</h2><p>Automatic whitespace detection handles the common case quickly across a whole document, while manual per-page adjustment covers documents where pages genuinely need different treatment — a scanned book with inconsistent margins, for instance.</p><h2>Common use cases</h2><p>Trimming excess white margin from a scanned document, cropping a PDF exported from a webpage that includes unwanted browser chrome, standardizing page dimensions across a document combined from multiple sources, or removing a printer's crop marks from a print-ready file before digital distribution.</p>",
  },
  "crop-video": {
    howItWorks: {
      title: "How to crop a video",
      steps: [
        "Upload your video file.",
        "Drag the crop boundary on the video preview frame.",
        "Preview how the cropped frame looks across the timeline.",
        "Download your cropped video.",
      ],
    },
    faq: [
      {
        question: "Does cropping affect the whole video, or just one frame?",
        answer:
          "The crop region you select applies consistently across the entire video's duration — every frame is cropped to the same selected area.",
      },
      {
        question: "Can I crop to a specific aspect ratio for a particular platform?",
        answer:
          "Yes, you can crop to standard aspect ratios (like a square or vertical 9:16 frame) or a fully custom region, depending on where the video needs to be used.",
      },
      {
        question: "Does cropping reduce video quality?",
        answer:
          "The kept region retains the source footage's original pixel data — cropping removes the parts outside your selection rather than degrading what remains inside it.",
      },
      {
        question: "Why would I crop a video instead of resizing it?",
        answer:
          "Resizing scales the whole frame to new dimensions while keeping everything visible. Cropping removes part of the frame entirely, which is what you want when you need to cut out unwanted content at the edges or change the video's aspect ratio without letterboxing.",
      },
      {
        question: "How long does cropping a video take?",
        answer:
          "Processing time depends on your video's length and resolution and your device's processing power, since it's re-encoded entirely on your own hardware.",
      },
      {
        question: "Is my video uploaded to a server?",
        answer:
          "No. Every operation runs locally in your browser using a real FFmpeg engine compiled to WebAssembly. Your video is never transmitted anywhere.",
      },
    ],
    longDescription: "<h2>Why crop video with Tools Root</h2><p>Removing unwanted content at the edge of a frame, reformatting a video for a platform that expects a specific aspect ratio (like vertical video for mobile stories), or focusing attention on a specific part of the frame are all common reasons to crop rather than just resize.</p><h2>Consistent cropping across the full timeline</h2><p>Once you select a crop region on the preview frame, it applies uniformly across every frame of the video's duration, giving a clean, consistent result rather than a crop that only affects a single moment.</p><h2>Common use cases</h2><p>Reformatting a landscape video into a vertical 9:16 frame for mobile platforms, removing unwanted content visible at the edge of a screen recording, cropping out a watermark or logo from footage you have rights to modify, or focusing a wide shot down to a specific subject.</p>",
  },
  "delete-pdf-pages": {
    howItWorks: {
      title: "How to delete pages from a PDF",
      steps: [
        "Upload your PDF.",
        "Browse the visual thumbnail grid of every page.",
        "Click to select the pages you want to remove — selected pages are marked clearly.",
        "Apply the deletion and download the resulting PDF.",
      ],
    },
    faq: [
      {
        question: "Can I select multiple pages to delete at once, not just one at a time?",
        answer:
          "Yes, click through as many thumbnails as you want to mark for deletion before applying the change — there's no need to process one page removal at a time.",
      },
      {
        question: "What happens to the page numbers after I delete pages?",
        answer:
          "Remaining pages shift up to fill the gap in the file's internal page order. If the document has visible printed page numbers baked into the page content itself, those aren't automatically renumbered — use the Number Pages tool afterward if you want fresh sequential numbers.",
      },
      {
        question: "Can I delete every page except the ones I want, instead of selecting pages to remove?",
        answer:
          "If you'd rather specify which pages to keep instead of which to remove, Extract Pages does exactly that — you select the pages you want, and everything else is dropped.",
      },
      {
        question: "Will deleting pages affect the file size much?",
        answer:
          "Yes, proportionally — since the removed pages' content (including any large embedded images) is dropped entirely rather than hidden, the resulting file is smaller by roughly the removed pages' share of the original.",
      },
      {
        question: "Can I undo a deletion after downloading?",
        answer:
          "The downloaded file reflects your selection permanently, but since your original upload was never modified on your device, you can just re-upload it and start over with a different selection.",
      },
      {
        question: "Does this work on scanned PDFs the same way as text-based ones?",
        answer:
          "Yes — deletion works on the page structure itself, so it doesn't matter whether a given page contains scanned images, real text, or both.",
      },
      {
        question: "Is my file uploaded to a server?",
        answer:
          "No. Every operation on this page runs locally in your browser using JavaScript and WebAssembly. Your file is never transmitted anywhere, which also means it works without an internet connection once the page has loaded.",
      },
    ],
    longDescription: "<h2>Why delete PDF pages with Tools Root</h2><p>Blank scanned pages, an accidentally duplicated sheet, or an internal cover page you don't want to share externally are all common reasons to trim a PDF down without touching the pages you're keeping. A visual thumbnail picker means you're never guessing which page number corresponds to which content.</p><h2>A visual, low-error way to edit page-by-page</h2><p>Rather than typing page ranges into a text field and hoping you counted correctly, you see every page as a thumbnail and click directly on the ones to remove, which is considerably harder to get wrong on a long document.</p><h2>Common use cases</h2><p>Removing a blank page left behind by a scanner's duplex feed, cutting an outdated cover sheet before forwarding a document externally, trimming appendix pages a recipient doesn't need, or cleaning up a merged PDF that ended up with a stray duplicate page.</p>",
  },
  "excel-to-pdf": {
    howItWorks: {
      title: "How to convert Excel to PDF",
      steps: [
        "Upload your XLSX, XLS, or CSV file.",
        "The tool calculates correct page breaks and print scaling to fit your data.",
        "Preview how the spreadsheet will paginate.",
        "Download your PDF.",
      ],
    },
    faq: [
      {
        question: "What spreadsheet formats are supported?",
        answer:
          "XLSX, the older XLS format, and plain CSV files can all be converted to PDF.",
      },
      {
        question: "How does this handle spreadsheets too wide or long to fit one page?",
        answer:
          "The tool calculates page breaks and print scaling automatically, splitting wide or tall data across multiple pages the way a spreadsheet application's print view would, rather than cutting content off arbitrarily.",
      },
      {
        question: "Will cell formatting, like colors and borders, be preserved?",
        answer:
          "Yes, cell formatting including borders, background colors, and text styling carries over into the PDF output.",
      },
      {
        question: "Can I convert a spreadsheet with multiple sheets/tabs?",
        answer:
          "Multi-sheet workbooks are supported, with each sheet's content properly paginated in the resulting PDF.",
      },
      {
        question: "Will formulas show their calculated values or the formula text?",
        answer:
          "The PDF shows calculated values, exactly as they'd display in the spreadsheet application itself, not the underlying formula syntax.",
      },
      {
        question: "Is my file uploaded to a server?",
        answer:
          "No. Every operation runs locally in your browser using JavaScript and WebAssembly. Your file is never transmitted anywhere, which also means it works without an internet connection once the page has loaded.",
      },
    ],
    longDescription: "<h2>Why convert Excel to PDF with Tools Root</h2><p>Sharing a spreadsheet as a PDF locks in exactly how it looks and paginates, which matters when the recipient shouldn't be able to accidentally edit formulas or when the data needs to print cleanly regardless of the reader's own spreadsheet software settings.</p><h2>Correct pagination, not a cut-off mess</h2><p>Spreadsheets that are wider or taller than a single printed page are a common pain point for naive converters, which either shrink everything illegibly or cut data off entirely. This tool calculates real page breaks and scaling so wide tables spread across pages sensibly.</p><h2>Common use cases</h2><p>Converting a budget spreadsheet to PDF for sharing with someone who shouldn't edit the formulas, preparing a data export as a fixed PDF for an official record, turning a CSV data dump into a readable, printable document, or sending a financial report in a format that displays identically for everyone.</p>",
  },
  "extract-archive": {
    howItWorks: {
      title: "How to extract an archive",
      steps: [
        "Upload your compressed archive: ZIP, RAR, 7Z, TAR, or GZ.",
        "The tool reads and decompresses the archive's contents.",
        "Browse the extracted file list.",
        "Download individual files, or all of them together as a ZIP.",
      ],
    },
    faq: [
      {
        question: "Which archive formats can I extract?",
        answer:
          "ZIP, RAR, 7Z, TAR, and GZ archives can all be extracted, covering the most common compressed formats you're likely to receive.",
      },
      {
        question: "Can I extract a RAR file even though RAR isn't an option when creating an archive?",
        answer:
          "Yes — RAR is a proprietary format, so full read support is included for extracting RAR archives you receive, even though creating new RAR archives isn't offered as an output option.",
      },
      {
        question: "Can I download just one file from inside the archive, or do I have to extract everything?",
        answer:
          "Both are supported — browse the archive's contents and download individual files you need, or extract everything at once as a ZIP.",
      },
      {
        question: "Does extraction preserve the original files exactly?",
        answer:
          "Yes, standard archive compression is lossless, so extracted files are byte-for-byte identical to what was originally compressed.",
      },
      {
        question: "What if my archive is password-protected?",
        answer:
          "This tool is built for extracting standard, unprotected archives. A password-protected archive would need its password entered wherever that protection is supported, which isn't part of this tool's current functionality.",
      },
      {
        question: "Is my file uploaded to a server?",
        answer:
          "No. Archive extraction runs entirely in your browser using a real compiled compression engine. Your files are never transmitted anywhere.",
      },
    ],
    longDescription: "<h2>Why extract archives with Tools Root</h2><p>Receiving a compressed file — a ZIP of documents, a RAR download, a 7Z software package — is only useful once it's unpacked. This tool decompresses any of the common archive formats directly in your browser and lets you grab exactly the files you need.</p><h2>Broad format support, including RAR</h2><p>Beyond the widely used ZIP format, this tool also reads 7Z, TAR, GZ, and RAR archives — RAR being a proprietary format that's genuinely more complex to support than the others, included here specifically because it's common enough in the wild that extraction needs to just work.</p><h2>Common use cases</h2><p>Unpacking a ZIP of documents received by email, extracting a RAR archive downloaded from the web, opening a 7Z software package to access its contents, or pulling a single file out of a large archive without extracting everything.</p>",
  },
  "extract-audio-from-video": {
    howItWorks: {
      title: "How to extract audio from a video",
      steps: [
        "Upload your video file.",
        "Choose your desired audio output format.",
        "The tool pulls just the audio track out of the video.",
        "Download the extracted audio file.",
      ],
    },
    faq: [
      {
        question: "What audio format will the extracted track be in?",
        answer:
          "You choose the output format — common options include MP3, WAV, and AAC, so you can pick whatever fits your next step, whether that's editing, sharing, or archiving.",
      },
      {
        question: "Does extraction affect the video file itself?",
        answer:
          "No, your original video file on your device is untouched — this tool reads it to pull out a copy of the audio track, it doesn't modify the source video.",
      },
      {
        question: "Will the extracted audio be the full quality of the original video's soundtrack?",
        answer:
          "The audio is extracted at the quality present in the source video's audio track, and then encoded to your chosen output format and settings — extraction itself doesn't degrade what was already in the video file.",
      },
      {
        question: "Can I extract audio from any video format?",
        answer:
          "Common video formats including MP4, MOV, AVI, and others are supported as sources for audio extraction.",
      },
      {
        question: "Why would I need to pull audio out of a video?",
        answer:
          "Common reasons include wanting just the soundtrack or voiceover from a video, creating a podcast episode from a recorded video call, or isolating background music or dialogue for separate editing.",
      },
      {
        question: "Is my file uploaded to a server?",
        answer:
          "No. Every operation runs locally in your browser using a real FFmpeg engine compiled to WebAssembly. Your file is never transmitted anywhere.",
      },
    ],
    longDescription: "<h2>Why extract audio from video with Tools Root</h2><p>Sometimes only the sound matters — a recorded interview's video isn't needed for a podcast release, a lecture's audio is more useful as a standalone file, or a song from a music video needs to become a normal audio file. This tool pulls the audio track out cleanly.</p><h2>Direct extraction, choice of output format</h2><p>Using a real FFmpeg engine to demux the audio stream from the video container, the extraction preserves the original audio quality present in the source, then encodes it to whichever format you choose for your next use.</p><h2>Common use cases</h2><p>Creating a podcast audio file from a recorded video interview, pulling the soundtrack from a personal video for separate listening, extracting a lecture's audio for offline listening without the video, or isolating dialogue or music from a video clip for editing.</p>",
  },
  "extract-pdf-pages": {
    howItWorks: {
      title: "How to extract pages from a PDF",
      steps: [
        "Upload your PDF.",
        "Select the pages you want to keep from the visual thumbnail grid.",
        "Click to build a new PDF from just those pages.",
        "Download the new, smaller document.",
      ],
    },
    faq: [
      {
        question: "How is this different from Split PDF?",
        answer:
          "Split PDF is for dividing a document into several output files that together cover the whole original. Extract Pages is for pulling out a specific subset of pages — which don't need to be contiguous — into a single new file, leaving the rest behind entirely.",
      },
      {
        question: "Can I extract non-consecutive pages, like pages 2, 7, and 15?",
        answer:
          "Yes — click any combination of pages in the thumbnail grid, in any order, and they'll be assembled into one new PDF.",
      },
      {
        question: "Will the extracted pages keep their original order, or the order I clicked them in?",
        answer:
          "Extracted pages appear in the new document in their original page order from the source file, regardless of the order you clicked them in, so the output always reads naturally.",
      },
      {
        question: "Does extracting pages preserve embedded fonts and images?",
        answer:
          "Yes, each extracted page is copied with its original fonts, images, and formatting fully intact — nothing is flattened or re-rendered.",
      },
      {
        question: "Can I extract pages from a scanned document?",
        answer:
          "Yes, extraction works on the page structure regardless of whether a page's content is scanned images, real text, or a mix.",
      },
      {
        question: "Is there a limit to how many pages I can extract?",
        answer:
          "No limit is enforced by the tool. Extremely large selections are only bounded by your device's available memory, since everything runs client-side.",
      },
      {
        question: "Is my file uploaded to a server?",
        answer:
          "No. Every operation on this page runs locally in your browser using JavaScript and WebAssembly. Your file is never transmitted anywhere, which also means it works without an internet connection once the page has loaded.",
      },
    ],
    longDescription: "<h2>Why extract PDF pages with Tools Root</h2><p>Sometimes you only need one section of a much longer document — a single chapter, a specific exhibit from a legal filing, or a handful of relevant pages from a long report. Extracting builds a fresh, standalone PDF from just the pages you pick, without the overhead of the rest of the original file.</p><h2>Precise, non-contiguous selection</h2><p>Because you're clicking directly on page thumbnails rather than typing a range, you can pull together pages from anywhere in the document — page 3, page 9, and page 22 — into one clean output, which a simple \"pages 1 to N\" range couldn't do.</p><h2>Common use cases</h2><p>Pulling a single relevant exhibit out of a large legal PDF, extracting just the pages a colleague asked for from a long report, isolating one chapter of an e-book for offline reading, or pulling the signature page out of a signed contract to file separately.</p>",
  },
  "fill-pdf-forms": {
    howItWorks: {
      title: "How to fill out a PDF form",
      steps: [
        "Upload the PDF form.",
        "The tool detects interactive form fields (text boxes, checkboxes, dropdowns) automatically.",
        "Fill in each field directly on the page.",
        "Flatten the form to make it permanent, or keep fields editable, then download.",
      ],
    },
    faq: [
      {
        question: "What happens if my PDF doesn't have real interactive form fields?",
        answer:
          "If the form was designed with actual fillable fields (common in government and business forms), those are detected and become directly fillable. For a PDF that's just a flat image or layout without real form fields, this tool won't be able to detect fields to fill automatically — Sign PDF may be a better fit for adding freeform text or a signature to a fixed layout.",
      },
      {
        question: "What kinds of form fields are supported?",
        answer:
          "Standard interactive PDF form field types are supported, including text boxes, checkboxes, radio buttons, and dropdown selections.",
      },
      {
        question: "What does \"flatten\" mean, and should I do it?",
        answer:
          "Flattening converts your filled-in answers from editable form fields into permanent page content, so the values can no longer be changed by anyone opening the file. Flatten before sending a form you don't want further edited; keep it unflattened if the recipient needs to make additional edits.",
      },
      {
        question: "Can I save a partially completed form and finish it later?",
        answer:
          "Download it without flattening, and the form fields remain editable — reopening it in this tool or another PDF form viewer lets you continue filling it in.",
      },
      {
        question: "Will filling out the form change its layout or design?",
        answer:
          "No, only the field values change — the form's visual design, labels, and layout remain exactly as the original creator designed them.",
      },
      {
        question: "Is my file, or the information I enter, uploaded to a server?",
        answer:
          "No. Field detection and filling happen entirely in your browser — neither the form nor the data you type into it is ever transmitted anywhere.",
      },
    ],
    longDescription: "<h2>Why fill PDF forms with Tools Root</h2><p>Interactive PDF forms — tax documents, applications, intake forms — are designed to be filled digitally, but doing so often gets routed through printing, handwriting, and scanning anyway if you don't have the right software. This tool detects a form's real fields and lets you fill them directly.</p><h2>Real field detection, with a choice about permanence</h2><p>Because this reads the PDF's actual interactive form field data rather than just displaying an image of the form, checkboxes behave like checkboxes and dropdowns behave like dropdowns. Choosing whether to flatten the result gives you control over whether the recipient can still edit your answers.</p><h2>Common use cases</h2><p>Filling out a government form that has real interactive fields, completing a job application PDF without printing it, filling in an intake form before an appointment, or completing a business form that needs to be flattened before returning it so answers can't be altered.</p>",
  },
  "html-to-pdf": {
    howItWorks: {
      title: "How to convert HTML to PDF",
      steps: [
        "Upload your HTML file.",
        "The tool renders it using the browser's own layout engine for accurate CSS fidelity.",
        "Preview how the page will paginate.",
        "Download your PDF.",
      ],
    },
    faq: [
      {
        question: "Will my CSS styling be preserved accurately?",
        answer:
          "Yes, this tool renders the HTML file using the browser's own layout engine rather than a separate, simplified rendering approximation, so CSS styling — layout, colors, fonts, spacing — comes through with real browser-level fidelity.",
      },
      {
        question: "Does this support external stylesheets and images referenced in the HTML?",
        answer:
          "External resources referenced by the HTML file (stylesheets, images) need to be accessible for the tool to render them correctly — an HTML file that only references purely local relative paths without those files also being available may render incompletely.",
      },
      {
        question: "How does pagination work for a long HTML page?",
        answer:
          "Content flows across multiple PDF pages automatically, similar to how a browser's own print function paginates a long webpage.",
      },
      {
        question: "Will JavaScript on the page run before conversion?",
        answer:
          "This tool renders the HTML's structure and CSS for accurate visual fidelity; content that depends on complex runtime JavaScript execution to appear may not be reflected the same way a live, fully-interactive browser session would show it.",
      },
      {
        question: "Can I convert a full webpage I saved, or only a simple HTML snippet?",
        answer:
          "Both work — a complete saved HTML page with its styling, or a simpler standalone HTML file, convert using the same rendering process.",
      },
      {
        question: "Is my file uploaded to a server?",
        answer:
          "No. Every operation runs locally in your browser using JavaScript and WebAssembly. Your file is never transmitted anywhere, which also means it works without an internet connection once the page has loaded.",
      },
    ],
    longDescription: "<h2>Why convert HTML to PDF with Tools Root</h2><p>Turning a web page or HTML document into a fixed, shareable PDF is useful for archiving, printing, or distributing content that was designed for a browser but now needs to exist as a standalone file.</p><h2>Real browser rendering, not an approximation</h2><p>This tool renders HTML using the browser's own layout engine, which is what gives it genuine CSS fidelity — the same box model, font rendering, and layout behavior a real browser applies, rather than a simplified HTML-to-PDF library that only supports a subset of CSS.</p><h2>Common use cases</h2><p>Archiving a webpage's content as a static PDF, converting an HTML email template into a shareable document, turning an HTML-based report or invoice into PDF for sending, or preparing a saved web article for offline reading and printing.</p>",
  },
  "image-metadata": {
    howItWorks: {
      title: "How to view and remove image metadata",
      steps: [
        "Upload an image.",
        "View the extracted metadata: camera details, GPS coordinates if present, and color profile information.",
        "Click to strip all metadata in one step if you want to remove it.",
        "Download the image, with or without metadata as you chose.",
      ],
    },
    faq: [
      {
        question: "What metadata does this tool show?",
        answer:
          "Camera and shooting details (like camera model, exposure settings, and timestamp), GPS location coordinates if the photo was geotagged, and embedded color profile information, when present in the file.",
      },
      {
        question: "Why would a photo have GPS coordinates embedded in it?",
        answer:
          "Many smartphones and cameras embed the location where a photo was taken directly into the file's metadata by default, which can be a privacy concern if you're sharing photos publicly without realizing that location data travels with them.",
      },
      {
        question: "Does stripping metadata affect the visible image at all?",
        answer:
          "No, removing metadata only deletes the embedded data about the image (camera info, location, etc.) — the actual pixel content you see is completely unaffected.",
      },
      {
        question: "Why would I want to keep metadata instead of removing it?",
        answer:
          "Photographers often rely on embedded camera and exposure data for organizing and editing their photo library, and some platforms use color profile metadata to render colors accurately — stripping it isn't always the right call, which is why this tool shows you what's there before you decide.",
      },
      {
        question: "Can I strip metadata from a photo before posting it publicly?",
        answer:
          "Yes, this is one of the most common reasons to use this tool — removing GPS and camera metadata before sharing a photo on social media or a public website, so that information isn't unintentionally exposed.",
      },
      {
        question: "Does this work the same way for PNG and other formats, not just JPG?",
        answer:
          "Reading and displaying metadata (camera details, GPS, color profile) is currently JPG-specific, since that's where EXIF data most commonly lives. Stripping metadata works for any image format, including PNG — re-encoding through canvas removes whatever metadata was there regardless of the source format, even though this tool won't show you what it found beforehand for a non-JPG file. PNG can technically carry EXIF/GPS via a newer, less common chunk type, but it's uncommon in practice; PNGs are more likely to carry plain-text metadata like software name or an embedded AI generation prompt than camera or location data.",
      },
      {
        question: "Is my image uploaded to a server?",
        answer:
          "No. Metadata is read and, if you choose, removed entirely in your browser. Your image is never transmitted anywhere.",
      },
    ],
    longDescription: "<h2>Why check image metadata with Tools Root</h2><p>Photos carry more than just pixels — camera settings, timestamps, and often precise GPS coordinates are silently embedded by default on most phones and cameras. Seeing exactly what's in a file, and optionally removing it, is a genuine privacy and organizational tool.</p><h2>Inspect first, then decide</h2><p>Rather than blindly stripping everything, this tool shows you exactly what metadata is present — camera details, location, color profile — so you can make an informed choice about what to keep and what to remove before sharing an image publicly.</p><h2>Common use cases</h2><p>Checking whether a photo contains GPS location data before posting it publicly, stripping camera metadata before sharing a photo you'd rather keep more anonymous, inspecting a photo's exposure settings for photography reference, or cleaning metadata from images before including them in a public dataset.</p>",
  },
  "markdown-to-pdf": {
    howItWorks: {
      title: "How to convert Markdown to PDF",
      steps: [
        "Upload your Markdown (.md) file.",
        "The tool renders headings, lists, tables, and code blocks with proper styling.",
        "Preview the formatted result.",
        "Download your styled PDF.",
      ],
    },
    faq: [
      {
        question: "What Markdown elements are supported?",
        answer:
          "Headings, ordered and unordered lists, tables, code blocks with monospace formatting, bold and italic text, links, and blockquotes are all rendered with proper visual styling, not just their raw Markdown syntax.",
      },
      {
        question: "Will code blocks be formatted with a monospace font?",
        answer:
          "Yes, code blocks render in a monospace font with appropriate spacing, distinct from the body text, matching how Markdown code blocks typically display in a rendered viewer.",
      },
      {
        question: "Do Markdown tables convert into properly formatted tables?",
        answer:
          "Yes, Markdown table syntax is parsed and rendered as an actual formatted table with borders and aligned columns in the PDF, not left as raw pipe-and-dash text.",
      },
      {
        question: "Can I convert a README file or technical documentation this way?",
        answer:
          "Yes, this is a common use — technical documentation written in Markdown (like a project README) converts into a clean, readable PDF suitable for sharing outside of a code repository.",
      },
      {
        question: "Are nested lists and multiple heading levels supported?",
        answer:
          "Yes, heading hierarchy (H1 through H6) and nested list structures are both preserved and styled distinctly in the output.",
      },
      {
        question: "Is my file uploaded to a server?",
        answer:
          "No. Every operation runs locally in your browser using JavaScript and WebAssembly. Your file is never transmitted anywhere, which also means it works without an internet connection once the page has loaded.",
      },
    ],
    longDescription: "<h2>Why convert Markdown to PDF with Tools Root</h2><p>Markdown is a favorite format for writing documentation, notes, and READMEs, but its raw syntax (the pound signs, asterisks, and pipe characters) isn't meant to be the final reading experience. Converting to PDF turns that source into a properly typeset document.</p><h2>Real rendering, not raw syntax</h2><p>Headings, lists, tables, and code blocks are genuinely parsed and styled — headings get real heading typography, tables become actual bordered tables, and code blocks get monospace formatting — rather than displaying the literal Markdown symbols in the output.</p><h2>Common use cases</h2><p>Turning a project's README into a shareable PDF for a non-technical audience, converting meeting notes written in Markdown into a formatted document, preparing technical documentation for distribution outside a code repository, or archiving a Markdown-based blog post as a standalone PDF.</p>",
  },
  "merge-audio": {
    howItWorks: {
      title: "How to merge audio files",
      steps: [
        "Upload two or more audio files.",
        "Reorder them into the sequence you want them combined.",
        "The tool joins them into one continuous track.",
        "Download the merged audio file.",
      ],
    },
    faq: [
      {
        question: "Can I merge audio files of different formats together?",
        answer:
          "Yes, you can combine files in different source formats (like an MP3 and a WAV) — they'll be merged into one continuous track in your chosen output format.",
      },
      {
        question: "Is there a gap or silence between merged clips?",
        answer:
          "Clips are joined directly in sequence without an added gap by default, producing one continuous track from the combined files in the order you set.",
      },
      {
        question: "Can I reorder the files before merging?",
        answer:
          "Yes, drag the uploaded files into whatever sequence you want them to appear in the final combined track.",
      },
      {
        question: "Is there a limit to how many files I can merge?",
        answer:
          "No hard limit is enforced by the tool. Very long combined tracks are only bounded by your device's available memory, since merging happens entirely in your browser.",
      },
      {
        question: "Will merging affect the audio quality of each clip?",
        answer:
          "Each source clip's audio is preserved during merging; the final quality depends on your chosen output format and its settings, the same as with any audio export.",
      },
      {
        question: "Is my file uploaded to a server?",
        answer:
          "No. Every operation runs locally in your browser using a real FFmpeg engine compiled to WebAssembly. Your files are never transmitted anywhere.",
      },
    ],
    longDescription: "<h2>Why merge audio with Tools Root</h2><p>Combining several separate audio recordings into one continuous file is common for podcast episodes recorded in segments, joining a series of voice memos, or assembling a single soundtrack from multiple clips.</p><h2>Sequenced merging with format flexibility</h2><p>Files don't need to share the same source format before merging, and reordering them before combining means the final sequence matches exactly what you intend, rather than defaulting to upload order.</p><h2>Common use cases</h2><p>Combining separately recorded podcast segments into one episode file, joining a series of voice memos into a single recording, merging intro and outro music with a spoken track, or assembling multiple audio clips into one file for easier sharing.</p>",
  },
  "merge-pdf": {
    howItWorks: {
      title: "How to merge PDF files",
      steps: [
        "Drag and drop two or more PDF files into the upload area, or click to browse.",
        "Reorder the files by dragging them into the sequence you want in the final document.",
        "Click \"Merge PDFs now\" — the combined file is ready in seconds.",
        "Download your merged PDF.",
      ],
    },
    faq: [
      {
        question: "Is there a limit to how many PDFs I can merge?",
        answer:
          "No hard limit is enforced by this tool. Very large combined files are only bounded by your device's available memory, since merging happens entirely in your browser.",
      },
      {
        question: "Will the page order and formatting be preserved?",
        answer:
          "Yes. Each source PDF's pages are copied into the new document exactly as they appear, including embedded fonts, images, and page size — nothing is re-rendered or flattened.",
      },
      {
        question: "Can I reorder pages after merging, not just reorder the files?",
        answer:
          "This tool merges whole files in the order you set before merging. If you need to reorder or delete individual pages afterward, run the merged file through the Rearrange Pages tool.",
      },
      {
        question: "Do the PDFs need to be the same page size?",
        answer:
          "No. Each page keeps its own original dimensions in the merged file — mixing a portrait A4 document with a landscape spreadsheet export works fine.",
      },
      {
        question: "What happens to bookmarks and links in the original files?",
        answer:
          "Internal bookmarks from each source file are preserved within that file's section of the merged document. Links that point to a specific page within the same source file continue to work.",
      },
      {
        question: "Can I merge password-protected PDFs?",
        answer:
          "You'll need to remove the password first using the Unlock PDF tool, since this tool needs to read each file's actual page content to merge it.",
      },
      {
        question: "Does merging reduce file quality?",
        answer:
          "No. Pages are copied at their original resolution and quality — merging doesn't re-encode images or text. If you also want a smaller file, run the result through Compress PDF afterward.",
      },
      {
        question: "Is my file uploaded to a server?",
        answer:
          "No. Every operation on this page runs locally in your browser using JavaScript and WebAssembly. Your file is never transmitted anywhere, which also means it works without an internet connection once the page has loaded.",
      },
    ],
    longDescription: "<h2>Why merge PDFs with Tools Root</h2><p>Combining reports, scanned forms, invoices, or chapters into a single PDF is one of the most common document tasks there is, and it shouldn't require installing desktop software or handing your files to a server you don't control. This tool copies each source PDF's real page content — fonts, images, and page geometry — directly into a new document, so the result looks exactly like the originals, just stitched together.</p><h2>How it works under the hood</h2><p>Merging uses a PDF engine that reads and writes the actual PDF object structure rather than rasterizing pages into images and rebuilding a new file from pictures. That's why text stays selectable and searchable in the merged output, and why file size doesn't balloon the way it would if pages were flattened to images first.</p><h2>Common use cases</h2><p>Combining multiple scanned pages of a signed contract into one file, assembling a multi-chapter report from separate department submissions, merging a cover letter with a resume before emailing an application, or joining several monthly statements into a single annual record for tax purposes.</p>",
  },
  "normalize-audio": {
    howItWorks: {
      title: "How to normalize audio volume",
      steps: [
        "Upload your audio file.",
        "Choose a target loudness level.",
        "The tool analyzes and adjusts volume to reach a consistent level throughout.",
        "Download the normalized audio.",
      ],
    },
    faq: [
      {
        question: "What does audio normalization actually do?",
        answer:
          "It analyzes the file's volume level and adjusts it so the overall loudness reaches a consistent target — useful for recordings that are too quiet, too loud, or where volume drifts noticeably between sections.",
      },
      {
        question: "Is this the same as just increasing the volume?",
        answer:
          "Not quite — normalization targets a consistent perceived loudness level rather than simply applying a flat volume boost, which helps avoid clipping (harsh distortion from a signal that's too loud) that a simple volume increase could cause.",
      },
      {
        question: "Will normalizing fix uneven volume between different parts of a recording?",
        answer:
          "Standard normalization primarily addresses overall file loudness. Recordings with dramatic volume swings between sections (like a podcast with an inconsistent recording setup) benefit from normalization but may still show some variation, since it's targeting overall loudness rather than moment-to-moment leveling.",
      },
      {
        question: "Why would I need to normalize audio before publishing it?",
        answer:
          "Many podcast and streaming platforms recommend or require audio at a specific loudness standard, both for a consistent listening experience across episodes and to avoid tracks sounding jarringly louder or quieter than others in a playlist.",
      },
      {
        question: "Does normalization affect audio quality otherwise?",
        answer:
          "The adjustment targets loudness specifically — it doesn't apply additional compression, equalization, or other quality changes beyond bringing the volume to the target level.",
      },
      {
        question: "Is my file uploaded to a server?",
        answer:
          "No. Every operation runs locally in your browser using a real FFmpeg engine compiled to WebAssembly. Your file is never transmitted anywhere.",
      },
    ],
    longDescription: "<h2>Why normalize audio with Tools Root</h2><p>A recording that's too quiet forces listeners to turn up their volume (only to be blasted by the next track), while one that's too loud can sound harsh or distorted. Normalizing brings a file to a consistent, appropriate loudness level automatically.</p><h2>Loudness-targeted, not just a volume slider</h2><p>Rather than a blunt volume multiplier that risks clipping, normalization analyzes the file and adjusts it toward a specific target loudness, which is the same general approach professional audio and podcast platforms use to keep listening levels consistent.</p><h2>Common use cases</h2><p>Bringing a quiet voice memo up to a comfortable listening volume, normalizing podcast episodes to a consistent loudness before publishing, matching volume levels across a batch of recordings from different sources, or preparing an audio file to meet a platform's loudness requirements.</p>",
  },
  "number-pdf-pages": {
    howItWorks: {
      title: "How to add page numbers to a PDF",
      steps: [
        "Upload your PDF.",
        "Choose the position (corner or center, top or bottom) and starting number.",
        "Pick a font size and numbering format.",
        "Apply and download the numbered PDF.",
      ],
    },
    faq: [
      {
        question: "Can I start numbering from something other than 1?",
        answer:
          "Yes, you can set any starting number, which is useful if this document is a continuation of a series or you want to skip a numbered cover page.",
      },
      {
        question: "Can I choose where on the page the numbers appear?",
        answer:
          "Yes, standard positions like bottom-center, bottom-right, top-center, and top-right are supported, along with font size adjustment.",
      },
      {
        question: "Will page numbers overlap with existing content?",
        answer:
          "Numbers are placed in the page margin at the position you choose, which avoids overlapping typical body content — check the preview before finalizing if your document has unusually large margins or footer content already.",
      },
      {
        question: "Can I skip numbering on a cover page?",
        answer:
          "Set the starting number to begin at page 2 conceptually by adjusting the starting value, or process only a subset of the document if you need the cover page to have no number at all — for full control, combine this with Split PDF to number sections separately.",
      },
      {
        question: "Does this replace existing page numbers already printed on the pages?",
        answer:
          "No, this adds new numbers as an additional layer — if a document already has printed numbers from its original source, both will appear unless you're numbering a version without them.",
      },
      {
        question: "Is my file uploaded to a server?",
        answer:
          "No. Every operation on this page runs locally in your browser using JavaScript and WebAssembly. Your file is never transmitted anywhere, which also means it works without an internet connection once the page has loaded.",
      },
    ],
    longDescription: "<h2>Why add page numbers with Tools Root</h2><p>A document without page numbers is hard to reference in a meeting, a legal proceeding, or a printed handout — \"see the third paragraph on the page after the chart\" is a lot less useful than \"see page 14.\" Adding numbers after the fact is common when a document was assembled from multiple unnumbered sources.</p><h2>Flexible positioning and starting point</h2><p>Because numbering position, font size, and starting value are all adjustable, this works equally well for a fresh document starting at page 1 and for a continuation document that needs to pick up where a previous section left off.</p><h2>Common use cases</h2><p>Numbering a merged report assembled from several unnumbered source documents, adding numbers to a scanned contract for easy reference during signing, preparing a printed handout where attendees need to follow along by page number, or numbering an appendix that continues from a main document's final page.</p>",
  },
  "ocr-pdf": {
    howItWorks: {
      title: "How to OCR a scanned PDF",
      steps: [
        "Upload your scanned PDF.",
        "Choose the document's language for accurate text recognition.",
        "The tool runs on-device optical character recognition on every page.",
        "Download a new PDF with an invisible, searchable, selectable text layer over the original scan.",
      ],
    },
    faq: [
      {
        question: "What does OCR actually do to my scanned PDF?",
        answer:
          "It analyzes the scanned image on each page, recognizes the text characters it contains, and adds an invisible text layer positioned exactly over the corresponding words in the image — the page still looks like the original scan, but the text is now selectable, searchable, and copyable.",
      },
      {
        question: "Does this work for languages other than English?",
        answer:
          "Yes, a range of languages are supported — select the correct one before processing for the best accuracy, since recognition models are language-specific.",
      },
      {
        question: "How accurate is the text recognition?",
        answer:
          "Accuracy depends on scan quality — clean, high-resolution scans of typed text typically recognize very accurately, while low-resolution scans, handwriting, or unusual fonts reduce accuracy. This tool uses a genuine OCR engine (Tesseract), the same open-source engine widely used in production document-processing software.",
      },
      {
        question: "Will the visual appearance of my scanned pages change?",
        answer:
          "No, the original scanned image remains exactly as it was — OCR adds an invisible text layer on top, it doesn't alter or replace the visible page content.",
      },
      {
        question: "Does OCR processing require an internet connection?",
        answer:
          "The recognition itself runs locally in your browser. The language data for your selected language downloads once on first use (not your file — just the recognition model), after which it's cached for reuse.",
      },
      {
        question: "Can I search the resulting PDF in a normal PDF viewer afterward?",
        answer:
          "Yes, the output is a standard PDF with a real text layer — Ctrl+F search, text selection, and copy-paste all work in any standard PDF viewer, not just this site.",
      },
      {
        question: "Is my file uploaded to a server?",
        answer:
          "No. The scanned file itself is never uploaded — only the OCR language model data (not your file) is fetched from a CDN the first time you use a given language, so the recognition engine can run locally afterward.",
      },
    ],
    longDescription: "<h2>Why OCR your PDFs with Tools Root</h2><p>A scanned document — a paper form, an old book, a faxed contract — is just a picture of text as far as a computer is concerned, until OCR recognizes the actual characters. That's what makes the difference between a file you can only look at and one you can search, copy from, and reference by keyword.</p><h2>Real, self-hosted OCR, not a placeholder</h2><p>This uses Tesseract, a genuine open-source OCR engine trusted in production document pipelines, running as a self-hosted WebAssembly build. Recognition happens on-device — the only network activity is a one-time download of language recognition data (not your document) the first time you use a given language.</p><h2>Common use cases</h2><p>Making an old scanned contract searchable by keyword, digitizing a stack of paper forms into a searchable archive, recovering selectable text from a faxed document, or preparing a scanned research paper so quotes can be copied directly instead of retyped.</p>",
  },
  "password-protect-pdf": {
    howItWorks: {
      title: "How to password protect a PDF",
      steps: [
        "Upload the PDF you want to encrypt.",
        "Set the password required to open the file.",
        "Optionally restrict printing, copying, or editing permissions independently of the open password.",
        "Download the encrypted PDF.",
      ],
    },
    faq: [
      {
        question: "What kind of encryption does this use?",
        answer:
          "This tool applies standard PDF encryption to the file, which is the same protection mechanism supported by mainstream PDF readers like Adobe Acrobat — the resulting file requires the password in any compliant PDF viewer, not just this site.",
      },
      {
        question: "Can I restrict printing or copying without requiring a password to open the file?",
        answer:
          "Yes — permission restrictions (like disallowing printing or text copying) can be set independently of the open password, using a separate owner-level password that controls what's allowed once the file is opened.",
      },
      {
        question: "What happens if I forget the password I set?",
        answer:
          "There is no recovery mechanism — password-protected PDFs are designed so that only someone with the correct password can open them. Keep a record of the password somewhere secure, since it can't be recovered from the file afterward.",
      },
      {
        question: "Will password protection work on a PDF that already has form fields or signatures?",
        answer:
          "Yes, encryption is applied to the file as a whole and doesn't interfere with existing form fields, though some permission restrictions can limit whether those fields remain fillable, depending on the options you choose.",
      },
      {
        question: "Does encrypting the file change its content or formatting?",
        answer:
          "No, encryption only controls access to the file — the underlying pages, text, and images are stored exactly as they were, just wrapped in password protection.",
      },
      {
        question: "Can I later remove the password if I no longer need it?",
        answer:
          "Yes, use the Unlock PDF tool with the correct current password to remove protection and get back an unencrypted file.",
      },
      {
        question: "Is my file uploaded to a server?",
        answer:
          "No. Every operation on this page runs locally in your browser using JavaScript and WebAssembly. Your file, and the password you set, are never transmitted anywhere.",
      },
    ],
    longDescription: "<h2>Why password protect PDFs with Tools Root</h2><p>Sensitive documents — financial records, contracts, personal information — often need to be shared over channels that aren't fully private, like email. A password requirement means the file itself carries its own protection, independent of how it's transmitted.</p><h2>Real, standards-compliant encryption</h2><p>This uses a genuine PDF encryption implementation, via a fork of the pdf-lib library with real encrypt and decrypt support, rather than a superficial lock that only this site recognizes. The resulting file requires the password in Adobe Acrobat, Preview, or any other standards-compliant PDF reader.</p><h2>Common use cases</h2><p>Protecting a PDF containing financial statements before emailing it to an accountant, restricting printing on a document you're sharing for review only, adding a password to a legal contract before it's transmitted, or securing a file that will be stored somewhere outside your direct control.</p>",
  },
  "pdf-to-excel": {
    howItWorks: {
      title: "How to convert PDF to Excel",
      steps: [
        "Upload your PDF.",
        "The tool detects tabular data and extracts it into rows and columns.",
        "Review the extracted table structure.",
        "Download an editable XLSX spreadsheet.",
      ],
    },
    faq: [
      {
        question: "Does this work on any PDF, or only ones with tables?",
        answer:
          "This tool is built specifically to detect and extract tabular data — it works best on PDFs that contain actual tables (financial statements, data reports, structured forms) rather than PDFs that are mostly free-flowing prose.",
      },
      {
        question: "How accurate is table detection?",
        answer:
          "Tables with clear row and column structure (visible or implied by consistent alignment) extract most reliably. Unusually complex or irregular table layouts may require some manual cleanup in the resulting spreadsheet.",
      },
      {
        question: "What happens to text in the PDF that isn't part of a table?",
        answer:
          "Non-tabular text is extracted separately from the identified tables, so it isn't lost, though the primary purpose of this tool is reconstructing genuine table structure into usable spreadsheet rows and columns.",
      },
      {
        question: "Can I then use formulas on the extracted data in Excel?",
        answer:
          "Yes, once extracted into a real XLSX file, the data is in genuine spreadsheet cells that you can reference in formulas just like any other spreadsheet data.",
      },
      {
        question: "Does this work on scanned PDF tables, or only ones with real text?",
        answer:
          "This tool works from the PDF's actual text content model. For a scanned table with no selectable text, run OCR PDF first to add a text layer, then convert the result here.",
      },
      {
        question: "Is my file uploaded to a server?",
        answer:
          "No. Every operation runs locally in your browser using JavaScript and WebAssembly. Your file is never transmitted anywhere, which also means it works without an internet connection once the page has loaded.",
      },
    ],
    longDescription: "<h2>Why convert PDF to Excel with Tools Root</h2><p>Financial statements, data reports, and structured forms often only exist as PDFs, but analyzing that data — sorting it, charting it, running formulas on it — requires it to actually be in spreadsheet cells rather than static PDF text.</p><h2>Genuine table detection</h2><p>This tool uses real table-structure detection to identify rows and columns within the PDF's content, rebuilding them as an actual XLSX spreadsheet rather than dumping all text into a single unstructured column.</p><h2>Common use cases</h2><p>Extracting a bank statement's transaction table into a spreadsheet for budgeting, pulling data from a PDF report into Excel for further analysis, converting a printed price list back into editable spreadsheet form, or digitizing a structured form's data for record-keeping.</p>",
  },
  "pdf-to-powerpoint": {
    howItWorks: {
      title: "How to convert PDF to PowerPoint",
      steps: [
        "Upload your PDF.",
        "Each page becomes one editable presentation slide.",
        "Text and images are placed as editable slide elements.",
        "Download an editable PPTX file.",
      ],
    },
    faq: [
      {
        question: "Will each PDF page become one slide?",
        answer:
          "Yes, pages map one-to-one to slides, in the same order as the original PDF.",
      },
      {
        question: "Can I edit the text once it's converted?",
        answer:
          "Yes, text is placed as genuine editable text boxes on each slide, not as an unmovable flattened image, so you can revise wording directly in PowerPoint afterward.",
      },
      {
        question: "What happens to images in the original PDF?",
        answer:
          "Images are preserved and placed at their original position on the corresponding slide as editable image objects.",
      },
      {
        question: "Will the slide design look the same as the PDF page?",
        answer:
          "The tool aims to reproduce the visual layout of each page closely — text position, sizing, and images. Since PDF and PowerPoint use different underlying layout models, unusually complex page designs may need some manual adjustment after conversion.",
      },
      {
        question: "Why would I convert a PDF back into a presentation format?",
        answer:
          "This is useful when you only have the final exported PDF of a presentation (the original PPTX was lost, or you received it from someone else) but need to make edits or reuse the content in a new deck.",
      },
      {
        question: "Is my file uploaded to a server?",
        answer:
          "No. Every operation runs locally in your browser using JavaScript and WebAssembly. Your file is never transmitted anywhere, which also means it works without an internet connection once the page has loaded.",
      },
    ],
    longDescription: "<h2>Why convert PDF to PowerPoint with Tools Root</h2><p>Losing the original editable presentation file and being left with only an exported PDF is a common problem — this tool rebuilds an editable deck from the PDF pages so you can actually revise the content rather than starting from scratch.</p><h2>Editable output, not flattened images</h2><p>Text is placed as real, editable text boxes and images as genuine slide objects, rather than converting each page into one large uneditable picture — the difference between a starting point you can actually work with and one you'd have to rebuild by hand anyway.</p><h2>Common use cases</h2><p>Recovering an editable presentation when only the exported PDF survived, repurposing slide content from a PDF into a new deck, extracting a colleague's presentation content shared only as a PDF, or converting an old presentation archive back to an editable format for updating.</p>",
  },
  "pdf-to-word": {
    howItWorks: {
      title: "How to convert PDF to Word",
      steps: [
        "Upload your PDF.",
        "The tool extracts text with its original styling, embedded images, and detected tables.",
        "If the PDF is a scan with no selectable text, on-device OCR runs automatically first.",
        "Download an editable DOCX file.",
      ],
    },
    faq: [
      {
        question: "Will the converted Word document look exactly like my PDF?",
        answer:
          "This tool reconstructs the real structure of your PDF — text with its original font size and styling, embedded images at their original position, and detected tables as real Word tables — rather than producing a flat, unstyled text dump. Complex multi-column layouts or unusual designs may still lay out somewhat differently, since Word and PDF use fundamentally different layout models.",
      },
      {
        question: "What happens if my PDF is a scanned document?",
        answer:
          "If no selectable text is found in the PDF, this tool automatically runs on-device OCR to recognize the text before building the Word document, and lets you know the result came from OCR so you can double-check accuracy.",
      },
      {
        question: "Will tables convert into real, editable Word tables?",
        answer:
          "Yes, this tool includes real table detection that identifies tabular structure in the PDF and rebuilds it as genuine Word table objects, rather than text separated by tabs or spaces that only looks like a table.",
      },
      {
        question: "Can I then edit the text after conversion?",
        answer:
          "Yes, the output is a standard editable DOCX file — text, once converted, is fully editable in Word or any compatible word processor, whether it came from selectable PDF text or from OCR.",
      },
      {
        question: "Does this preserve fonts and colors from the original PDF?",
        answer:
          "Yes, per-run font styling (size, color, bold, italic) is read from the PDF's content model and reproduced in the Word output, rather than defaulting everything to one plain style.",
      },
      {
        question: "Is my file uploaded to a server?",
        answer:
          "No. Every operation runs locally in your browser using JavaScript and WebAssembly. Your file is never transmitted anywhere, which also means it works without an internet connection once the page has loaded.",
      },
    ],
    longDescription: "<h2>Why convert PDF to Word with Tools Root</h2><p>A PDF is easy to view but hard to edit — pulling text out to revise a contract, update a report, or repurpose content in a new document usually means retyping everything by hand unless the conversion tool actually understands the PDF's structure.</p><h2>Deep content extraction, not a flat text dump</h2><p>This uses a PDF parsing engine capable of deep content-model extraction: per-run font styling, real embedded images at their correct position, and genuine table detection — producing an editable document that looks like the source, not a wall of unformatted text. If the source is a scan rather than real text, on-device OCR runs automatically first.</p><h2>Common use cases</h2><p>Editing an old contract that only exists as a PDF, updating a report that was exported to PDF without keeping the original source file, extracting content from a scanned document into an editable format, or repurposing a PDF's content into a new document.</p>",
  },
  "powerpoint-to-pdf": {
    howItWorks: {
      title: "How to convert PowerPoint to PDF",
      steps: [
        "Upload your PPTX file.",
        "Choose whether to include speaker notes in the output.",
        "The tool preserves slide layout, images, and text formatting.",
        "Download your PDF, one page per slide.",
      ],
    },
    faq: [
      {
        question: "Will my slide layouts and design be preserved exactly?",
        answer:
          "Yes, this tool reads the presentation's actual OOXML structure directly, so layout, positioning, fonts, colors, and images carry over matching the original design.",
      },
      {
        question: "Can I include speaker notes in the PDF?",
        answer:
          "Yes, there's an option to include speaker notes alongside each slide, useful for creating a presenter-reference PDF rather than just the slides themselves.",
      },
      {
        question: "What happens to slide animations and transitions?",
        answer:
          "PDF is a static format, so animations and transitions don't carry over — each slide converts to its final, settled visual state as a single static page.",
      },
      {
        question: "Will embedded images and charts look the same?",
        answer:
          "Yes, embedded images and chart graphics are preserved in their original position and appearance within each slide.",
      },
      {
        question: "How many pages will the PDF have?",
        answer:
          "One page per slide by default, in the same order as the original presentation, optionally with a following notes page per slide if you include speaker notes.",
      },
      {
        question: "Is my file uploaded to a server?",
        answer:
          "No. Every operation runs locally in your browser using JavaScript and WebAssembly. Your file is never transmitted anywhere, which also means it works without an internet connection once the page has loaded.",
      },
    ],
    longDescription: "<h2>Why convert PowerPoint to PDF with Tools Root</h2><p>Sharing a presentation as a PDF avoids version compatibility issues (fonts rendering differently, layouts shifting) and ensures whoever opens it sees exactly the slides you designed, without needing PowerPoint installed at all.</p><h2>Faithful layout, with optional speaker notes</h2><p>Because this tool parses the presentation's actual OOXML structure rather than approximating it, slide positioning, fonts, and images render matching the source. Including speaker notes is optional, for when the PDF needs to double as a presenter reference rather than just the visual slides.</p><h2>Common use cases</h2><p>Sharing a finished presentation with a client who doesn't have PowerPoint, submitting slides for a conference that requires PDF format, archiving a presentation in a format that won't shift with future PowerPoint updates, or preparing a presenter's copy that includes speaker notes.</p>",
  },
  "rearrange-pdf-pages": {
    howItWorks: {
      title: "How to rearrange PDF pages",
      steps: [
        "Upload your PDF.",
        "Drag page thumbnails into the order you want.",
        "Duplicate or delete individual pages directly in the same view if needed.",
        "Download the reordered PDF.",
      ],
    },
    faq: [
      {
        question: "Can I duplicate a page while rearranging, not just reorder them?",
        answer:
          "Yes — this tool combines reordering, duplication, and deletion in one workflow, so you can fully restructure a document without switching between separate tools.",
      },
      {
        question: "What's the difference between this and Rotate or Delete Pages?",
        answer:
          "Rotate and Delete Pages each do one specific operation. Rearrange Pages is the broader page-management workspace — drag to reorder, click to duplicate, click to delete — for when you need to do more than one of those things to the same document.",
      },
      {
        question: "Does dragging pages around affect their content or quality?",
        answer:
          "No. Reordering changes the sequence pages appear in, not the pages themselves — fonts, images, and resolution are untouched.",
      },
      {
        question: "Can I undo a reorder before downloading?",
        answer:
          "Yes, you can keep adjusting the order as many times as you like before you finalize and download — nothing is locked in until you export.",
      },
      {
        question: "Will page numbers printed on the page itself update to match the new order?",
        answer:
          "No — visible page numbers that are part of the page's actual content don't automatically renumber. Run the reordered file through the Number Pages tool afterward for fresh sequential numbers.",
      },
      {
        question: "Is there a limit to how many pages I can rearrange?",
        answer:
          "No hard limit is enforced by the tool. Very long documents are only bounded by your device's available memory, since everything runs in your browser.",
      },
      {
        question: "Is my file uploaded to a server?",
        answer:
          "No. Every operation on this page runs locally in your browser using JavaScript and WebAssembly. Your file is never transmitted anywhere, which also means it works without an internet connection once the page has loaded.",
      },
    ],
    longDescription: "<h2>Why rearrange PDF pages with Tools Root</h2><p>Documents assembled from multiple sources — scanned batches, merged reports, exported slide decks — often end up in the wrong order, or need a page duplicated for a table of contents entry, or need a stray page removed. Doing all of that in one visual workspace is faster than round-tripping through several single-purpose tools.</p><h2>One workspace for full page-level control</h2><p>The same drag-and-drop thumbnail grid supports reordering, duplicating, and deleting, so restructuring a document that needs more than one kind of change doesn't mean exporting and re-uploading between steps.</p><h2>Common use cases</h2><p>Reordering scanned pages that came out of a document feeder in the wrong sequence, duplicating a cover page to also use as a closing page, restructuring a merged report so sections appear in a more logical order, or cleaning up a slide-deck export before sharing it.</p>",
  },
  "remove-background": {
    howItWorks: {
      title: "How to remove the background from an image",
      steps: [
        "Upload a photo.",
        "The tool automatically detects and removes the background using an on-device machine learning model.",
        "Preview the result with a transparency checkerboard pattern.",
        "Download as a transparent PNG.",
      ],
    },
    faq: [
      {
        question: "How accurate is the automatic background removal?",
        answer:
          "It uses a real machine learning segmentation model, and works best on photos with a clear subject (like a person, product, or animal) against a reasonably distinct background. Complex edges like loose hair or fine fur, or a subject with low contrast against the background, are more challenging for any automatic segmentation approach.",
      },
      {
        question: "What file format is the output?",
        answer:
          "The result is a PNG with a transparent background (an alpha channel), which is the standard format for images that need to be placed over other backgrounds later.",
      },
      {
        question: "Does this tool require downloading anything beyond the page itself?",
        answer:
          "Yes — this is the one tool on Tools Root where the recognition model itself (not your photo) downloads from a third-party CDN the first time you use it, since the model is too large to bundle with the page for every visitor. After that first download, it's cached for reuse.",
      },
      {
        question: "Is my photo sent anywhere during background removal?",
        answer:
          "No. Only the machine learning model's weights are fetched externally on first use — your actual photo is never part of that request and is processed entirely on your device.",
      },
      {
        question: "Can I remove the background from multiple photos?",
        answer:
          "Process one photo at a time through this tool; for a large batch, run each photo through individually.",
      },
      {
        question: "What can I do with the transparent result?",
        answer:
          "A transparent PNG can be layered over any new background in a design tool, used for a product photo on a white or branded backdrop, or placed into a composite image alongside other elements.",
      },
    ],
    longDescription: "<h2>Why remove image backgrounds with Tools Root</h2><p>Isolating a subject from its background — a product for an e-commerce listing, a portrait for a composite, a logo element for a design — traditionally meant manual masking in photo-editing software. Automatic segmentation handles the common case in seconds.</p><h2>Real machine learning, running on your device</h2><p>This uses a genuine ONNX segmentation model rather than a simple color-based cutout, so it can distinguish a subject from a background even when the background isn't a flat, uniform color. It's the one tool here whose model weights load from a third-party CDN on first use — the model itself, not your photo — since the file is too large to bundle for every visitor upfront.</p><h2>Common use cases</h2><p>Isolating a product photo for a clean e-commerce listing, removing a background from a portrait for use in a composite graphic, extracting a logo element from a photographed sign, or preparing a headshot for a background-agnostic profile use.</p>",
  },
  "repair-pdf": {
    howItWorks: {
      title: "How to repair a corrupted PDF",
      steps: [
        "Upload the damaged or corrupted PDF.",
        "The tool attempts to parse and rebuild the file's internal structure.",
        "Review which pages were successfully recovered.",
        "Download the repaired PDF.",
      ],
    },
    faq: [
      {
        question: "What kinds of PDF corruption can this fix?",
        answer:
          "This tool targets structural issues — a malformed cross-reference table, truncated file data, or an incomplete write from an interrupted download or save — by attempting to rebuild the file's internal object structure from whatever valid data remains.",
      },
      {
        question: "Will repair always fully recover the file?",
        answer:
          "Not always — recovery depends on how much of the original file structure is intact. Files with severe or extensive corruption may only be partially recoverable, and the tool will show you which pages it was able to reconstruct.",
      },
      {
        question: "Why won't my PDF open in a normal viewer, but this tool can still read it?",
        answer:
          "Many PDF viewers refuse to open a file at all if its structure doesn't perfectly match the specification, even if most of the content is actually intact and readable. This tool attempts a more permissive parse to recover what it can rather than rejecting the whole file outright.",
      },
      {
        question: "Is there a specific cause of PDF corruption this can't handle?",
        answer:
          "If the underlying file data itself is missing or overwritten (as opposed to just structurally malformed), no repair tool can recreate content that no longer exists in the file — repair works with whatever bytes are actually present.",
      },
      {
        question: "Does repairing change the content of pages that weren't damaged?",
        answer:
          "No, undamaged pages and content are preserved exactly as they were — the repair process only rebuilds structural elements that were broken, not content that was already fine.",
      },
      {
        question: "Is my file uploaded to a server?",
        answer:
          "No. Every operation on this page runs locally in your browser using JavaScript and WebAssembly. Your file is never transmitted anywhere, which also means it works without an internet connection once the page has loaded.",
      },
    ],
    longDescription: "<h2>Why repair PDFs with Tools Root</h2><p>A PDF that won't open — because of an interrupted download, a corrupted transfer, or a bug in whatever software created it — is a genuinely stressful problem when the file matters. Repair attempts to reconstruct enough of the file's structure to get the document usable again, rather than leaving you with nothing.</p><h2>A more permissive parse than standard viewers</h2><p>Many mainstream PDF readers are strict: any deviation from the exact specification and they refuse to open the file at all, even if 95% of the content is intact. This tool takes a different approach, attempting to recover whatever valid structure and content remains rather than failing outright.</p><h2>Common use cases</h2><p>Recovering a PDF that got corrupted during an interrupted download, fixing a file that a buggy export tool wrote incorrectly, salvaging content from a PDF damaged during file transfer, or attempting recovery on an old file that no longer opens in modern software.</p>",
  },
  "resize-image": {
    howItWorks: {
      title: "How to resize an image",
      steps: [
        "Upload one or more images.",
        "Enter exact target dimensions in pixels, or a percentage of the original size.",
        "Toggle aspect ratio lock on or off depending on whether you want proportional scaling.",
        "Download the resized image, or all of them as a ZIP.",
      ],
    },
    faq: [
      {
        question: "Can I resize by exact pixel dimensions and by percentage?",
        answer:
          "Yes, both methods are supported — enter an exact width and height in pixels, or scale by a percentage of the original size, whichever fits how you're thinking about the resize.",
      },
      {
        question: "What does the aspect ratio lock do?",
        answer:
          "When locked, changing the width automatically adjusts the height proportionally (and vice versa) so the image doesn't appear stretched or squashed. Unlock it if you specifically want to change the width-to-height ratio.",
      },
      {
        question: "Will resizing to a larger size actually add detail, or just stretch the image?",
        answer:
          "Enlarging an image beyond its original resolution doesn't add new detail that wasn't captured in the source — it interpolates existing pixel data to fill the larger size, which can look softer than a genuinely higher-resolution original.",
      },
      {
        question: "Can I resize multiple images to the same dimensions at once?",
        answer:
          "Yes, batch resizing applies your chosen dimensions or percentage to every uploaded image, useful for standardizing a set of product photos or thumbnails to one consistent size.",
      },
      {
        question: "Does resizing affect image quality?",
        answer:
          "Shrinking an image generally looks clean since you're reducing detail that's still present in the source. Enlarging can look softer, as mentioned above, since it's estimating new pixels rather than capturing new detail.",
      },
      {
        question: "Is my image uploaded to a server?",
        answer:
          "No. Every operation runs locally in your browser using JavaScript and WebAssembly. Your image is never transmitted anywhere, which also means it works without an internet connection once the page has loaded.",
      },
    ],
    longDescription: "<h2>Why resize images with Tools Root</h2><p>Different platforms enforce different dimension requirements — a profile photo needs to be square, a banner needs specific pixel dimensions, a thumbnail needs to be small and consistent across a whole gallery. Resizing gets an image to the exact size a destination requires.</p><h2>Exact dimensions or proportional percentage</h2><p>Whether you know the precise pixel size you need or just want to scale something down by half, both approaches are supported, with an aspect-ratio lock to prevent accidental stretching when you only mean to change one dimension.</p><h2>Common use cases</h2><p>Resizing a photo to meet a passport or ID photo's exact pixel requirements, standardizing product photos to one consistent size for an online store, shrinking a large camera photo down for faster web use, or resizing a batch of images to a platform's specific banner or thumbnail dimensions.</p>",
  },
  "resize-video": {
    howItWorks: {
      title: "How to resize a video",
      steps: [
        "Upload your video file.",
        "Choose a standard resolution preset, or enter custom dimensions.",
        "The tool re-encodes the video at the new resolution.",
        "Download your resized video.",
      ],
    },
    faq: [
      {
        question: "What resolution presets are available?",
        answer:
          "Standard presets covering common resolutions (like 1080p, 720p, and 480p) are available, alongside the option to enter fully custom pixel dimensions.",
      },
      {
        question: "Will resizing to a smaller resolution reduce file size too?",
        answer:
          "Generally yes, since a smaller frame size means less pixel data to encode per frame, resizing down typically reduces file size as a side effect, though the exact reduction also depends on the bitrate settings used.",
      },
      {
        question: "Can I upscale a video to a higher resolution?",
        answer:
          "Yes, though upscaling doesn't add detail that wasn't in the original — it enlarges existing pixel data to fill the new dimensions, which can look softer than genuinely higher-resolution source footage.",
      },
      {
        question: "Does resizing change the video's aspect ratio?",
        answer:
          "Standard presets typically maintain the original aspect ratio; custom dimensions give you full control if you specifically need a different ratio, though that may introduce letterboxing or cropping depending on how you configure it.",
      },
      {
        question: "How long does resizing take?",
        answer:
          "Processing time depends on your video's length, original resolution, and your device's processing power, since re-encoding happens entirely on your own hardware.",
      },
      {
        question: "Is my video uploaded to a server?",
        answer:
          "No. Every operation runs locally in your browser using a real FFmpeg engine compiled to WebAssembly. Your video is never transmitted anywhere.",
      },
    ],
    longDescription: "<h2>Why resize video with Tools Root</h2><p>Different platforms enforce different resolution expectations — a mobile app might want 720p to save bandwidth, an archival copy might target the original 4K, and a specific ad placement might require exact custom dimensions. Resizing gets your video to whatever the destination requires.</p><h2>Presets for speed, custom dimensions for precision</h2><p>Standard resolution presets cover the common cases quickly, while fully custom width and height inputs handle specific requirements a preset wouldn't match.</p><h2>Common use cases</h2><p>Downscaling a 4K video to 1080p for faster uploading, resizing a video to match a specific platform's recommended dimensions, preparing a smaller-resolution version for mobile viewing, or standardizing a batch of videos from different sources to one consistent resolution.</p>",
  },
  "rotate-flip-image": {
    howItWorks: {
      title: "How to rotate or flip an image",
      steps: [
        "Upload one or more images.",
        "Rotate in 90-degree steps, or flip horizontally or vertically.",
        "Preview the result before finalizing.",
        "Download the rotated or flipped image.",
      ],
    },
    faq: [
      {
        question: "What's the difference between rotating and flipping?",
        answer:
          "Rotating turns the image around a center point, like correcting a sideways photo. Flipping mirrors the image along an axis — horizontal flip creates a left-right mirror image, vertical flip creates a top-bottom mirror image. They produce different results even at first glance for asymmetric images.",
      },
      {
        question: "Can I rotate by an angle other than 90-degree steps?",
        answer:
          "This tool supports quarter-turn rotations (90°, 180°, 270°), which covers the common case of a sideways or upside-down photo. For arbitrary fine-angle straightening, a dedicated photo editor with a straighten tool would be needed instead.",
      },
      {
        question: "Does rotating or flipping reduce image quality?",
        answer:
          "No, both operations rearrange existing pixels without recompressing or discarding image data, so quality is unaffected.",
      },
      {
        question: "Can I process multiple images with the same rotation at once?",
        answer:
          "Yes, batch processing applies the same rotation or flip to every uploaded image, useful for correcting a set of photos that all came out sideways from the same source.",
      },
      {
        question: "Will flipping change the image's dimensions?",
        answer:
          "No, dimensions stay the same for a flip. A 90° or 270° rotation does swap width and height, since the image is now oriented sideways relative to its original frame.",
      },
      {
        question: "Is my image uploaded to a server?",
        answer:
          "No. Every operation runs locally in your browser using JavaScript and WebAssembly. Your image is never transmitted anywhere, which also means it works without an internet connection once the page has loaded.",
      },
    ],
    longDescription: "<h2>Why rotate or flip images with Tools Root</h2><p>A photo taken with the phone sideways, an image that needs mirroring for a design layout, or a scanned photo that came out upside down are all quick fixes that shouldn't require photo-editing software.</p><h2>Both operations, batch-friendly</h2><p>Rotation corrects orientation; flipping mirrors the image along an axis, which is a genuinely different transformation useful for design layouts or correcting a scanned negative. Both apply to multiple images at once if you're fixing a whole batch with the same issue.</p><h2>Common use cases</h2><p>Fixing a sideways phone photo before sharing it, mirroring a logo for a design layout that needs it facing the opposite direction, correcting the orientation of a batch of scanned photos, or flipping a screenshot that was captured from a mirrored display.</p>",
  },
  "rotate-pdf": {
    howItWorks: {
      title: "How to rotate a PDF",
      steps: [
        "Upload the PDF you want to rotate.",
        "Choose to rotate every page, or select specific pages from the thumbnail grid.",
        "Pick a rotation angle: 90°, 180°, or 270°.",
        "Download the rotated PDF.",
      ],
    },
    faq: [
      {
        question: "Can I rotate just some pages and leave others alone?",
        answer:
          "Yes. Select individual pages in the thumbnail grid before applying the rotation — pages you don't select keep their original orientation.",
      },
      {
        question: "Why would a scanned PDF have pages in the wrong orientation?",
        answer:
          "This usually happens when a physical document is fed into a scanner sideways or upside down, or when pages from a landscape and portrait source are combined without correcting orientation first.",
      },
      {
        question: "Does rotating a page change its actual dimensions?",
        answer:
          "The page's rotation metadata changes, and viewers display it correctly rotated, but the underlying page size value follows standard PDF rotation behavior rather than being redrawn as a new physical page shape.",
      },
      {
        question: "Will rotation affect the text or image quality?",
        answer:
          "No. Rotation only changes the page's orientation metadata — the actual content (text, images, vector graphics) is not re-rendered or recompressed.",
      },
      {
        question: "Can I preview each page's current orientation before rotating?",
        answer:
          "Yes, the thumbnail grid shows every page as it currently appears, so you can see exactly which pages need correcting before you apply anything.",
      },
      {
        question: "What's the difference between 90° and 270° rotation?",
        answer:
          "90° rotates clockwise a quarter turn; 270° rotates the same amount counter-clockwise (equivalent to three 90° clockwise turns). Pick whichever direction gets a sideways page upright.",
      },
      {
        question: "Is my file uploaded to a server?",
        answer:
          "No. Every operation on this page runs locally in your browser using JavaScript and WebAssembly. Your file is never transmitted anywhere, which also means it works without an internet connection once the page has loaded.",
      },
    ],
    longDescription: "<h2>Why rotate PDFs with Tools Root</h2><p>A page that opens sideways is one of the most common annoyances in scanned or exported documents, and it's a quick fix rather than something worth re-scanning a whole document over. This tool lets you correct one page, a range, or the entire file in a couple of clicks, with a visual thumbnail grid so you know exactly what you're rotating before you commit.</p><h2>Selective, page-level control</h2><p>Unlike rotating an entire file in a PDF viewer's temporary view (which usually resets when you close and reopen it), this tool writes the rotation permanently into the file and lets you target individual pages — useful for documents where only a couple of scanned pages ended up sideways while the rest were fine.</p><h2>Common use cases</h2><p>Fixing sideways pages in a scanned contract, correcting a landscape chart that was scanned in portrait mode, preparing a mixed-orientation document for consistent printing, or straightening out a PDF exported from a mobile scanning app.</p>",
  },
  "rotate-video": {
    howItWorks: {
      title: "How to rotate a video",
      steps: [
        "Upload your video file.",
        "Choose a rotation angle: 90°, 180°, or 270°.",
        "Preview the rotated result.",
        "Download your rotated video.",
      ],
    },
    faq: [
      {
        question: "Why would a video need rotating?",
        answer:
          "This commonly happens with footage recorded on a phone held sideways, where the video plays back rotated incorrectly depending on the device or player used to view it.",
      },
      {
        question: "Does rotating a 90° or 270° angle change the video's dimensions?",
        answer:
          "Yes, a quarter-turn rotation swaps width and height, since the video is now oriented sideways relative to its original frame — a landscape video rotated 90° becomes a portrait-oriented video.",
      },
      {
        question: "Will rotating affect video or audio quality?",
        answer:
          "No, rotation changes orientation only — the underlying video and audio quality is otherwise preserved according to your export settings, the same as any re-encode.",
      },
      {
        question: "Can I rotate by an angle other than 90-degree steps?",
        answer:
          "This tool supports quarter-turn rotations (90°, 180°, 270°), which covers the common case of correcting a sideways or upside-down recording.",
      },
      {
        question: "How long does rotating a video take?",
        answer:
          "Processing time depends on your video's length, resolution, and your device's processing power, since it's re-encoded entirely on your own hardware.",
      },
      {
        question: "Is my video uploaded to a server?",
        answer:
          "No. Every operation runs locally in your browser using a real FFmpeg engine compiled to WebAssembly. Your video is never transmitted anywhere.",
      },
    ],
    longDescription: "<h2>Why rotate video with Tools Root</h2><p>Sideways or upside-down footage — usually from a phone recorded in the wrong orientation — is a quick and common fix that shouldn't require dedicated video editing software just to correct.</p><h2>Permanent, quarter-turn correction</h2><p>Unlike a player's temporary rotate-to-view setting that resets when the file is reopened elsewhere, this writes the rotation permanently into the video file, so it plays correctly oriented everywhere afterward.</p><h2>Common use cases</h2><p>Fixing a sideways phone recording before sharing it, correcting an upside-down video from a mounted or inverted camera, rotating footage to match the orientation of other clips before editing them together, or preparing sideways footage for a platform that doesn't auto-correct orientation.</p>",
  },
  "sign-pdf": {
    howItWorks: {
      title: "How to sign a PDF",
      steps: [
        "Upload the PDF you need to sign.",
        "Create your signature by drawing it, typing it in a script font, or uploading an image of your signature.",
        "Drag and position it anywhere on the document, resizing as needed.",
        "Apply and download the signed PDF.",
      ],
    },
    faq: [
      {
        question: "What signature methods are supported?",
        answer:
          "Three ways to create a signature: draw it freehand with your mouse or touchscreen, type your name and have it rendered in a handwriting-style script font, or upload an image of your actual signature (like a photo of your signed name on paper).",
      },
      {
        question: "Can I place the signature anywhere on the page, or only in fixed spots?",
        answer:
          "You can drag the signature to any position and resize it, which covers documents where the signature line isn't in a predictable, standard location.",
      },
      {
        question: "Is this a legally binding electronic signature?",
        answer:
          "This tool visually places a signature onto the document, similar to signing a printed page and scanning it back in. Whether that satisfies legal requirements for a binding signature depends on your jurisdiction and the type of document — for contracts with strict e-signature compliance needs, check what your specific situation requires.",
      },
      {
        question: "Can I add more than one signature, like for multiple signers?",
        answer:
          "Yes, you can add multiple signature instances to the same document if more than one person needs to sign, or if the document requires signing in more than one place.",
      },
      {
        question: "Does signing modify anything else in the document?",
        answer:
          "No, the signature is added as new content layered onto the page — the rest of the document's text and formatting is untouched.",
      },
      {
        question: "Is my file, or my signature image, uploaded to a server?",
        answer:
          "No. Everything — drawing, typing, positioning, and applying the signature — happens locally in your browser. Neither your document nor your signature is ever transmitted anywhere.",
      },
    ],
    longDescription: "<h2>Why sign PDFs with Tools Root</h2><p>Printing a document just to sign it and scan it back in is one of the more tedious parts of paperwork, especially for a single signature on an otherwise-digital document. Signing directly in the browser skips that entirely.</p><h2>Three ways to create a signature that looks like yours</h2><p>Drawing lets you sign with your actual hand motion using a mouse or touchscreen; typing renders your name in a script font for a quick, clean result; and uploading a photo of your real pen-and-paper signature gives the most authentic look if you already have one on hand.</p><h2>Common use cases</h2><p>Signing a rental agreement or freelance contract without printing it, adding a signature to a form before emailing it back, countersigning a document that's already been signed by someone else, or applying a consistent signature across several similar documents.</p>",
  },
  "split-audio": {
    howItWorks: {
      title: "How to split an audio file",
      steps: [
        "Upload your audio file.",
        "Set one or more split points on the waveform, or enter timestamps.",
        "Preview each resulting segment.",
        "Download the split files individually or as a ZIP.",
      ],
    },
    faq: [
      {
        question: "Can I split a file into more than two segments?",
        answer:
          "Yes, set as many split points as you need — a single long file can be divided into several separate segments at once, not just cut in two.",
      },
      {
        question: "How do I choose exactly where to split?",
        answer:
          "Set split points visually on the waveform, or enter precise timestamps if you already know the exact times you want to divide the file at.",
      },
      {
        question: "Can I download all the segments together?",
        answer:
          "Yes, after processing you can download each segment individually or grab all of them together in a single ZIP archive.",
      },
      {
        question: "Does splitting affect the audio quality of each segment?",
        answer:
          "No, each resulting segment retains the original audio's quality exactly — splitting only divides the file at your chosen points, it doesn't re-encode or degrade the content.",
      },
      {
        question: "Why would I split an audio file instead of just trimming it?",
        answer:
          "Trim keeps one selected portion and discards the rest. Split divides one file into multiple separate output files, useful when you need every resulting piece, not just one clip.",
      },
      {
        question: "Is my file uploaded to a server?",
        answer:
          "No. Every operation runs locally in your browser using a real FFmpeg engine compiled to WebAssembly. Your file is never transmitted anywhere.",
      },
    ],
    longDescription: "<h2>Why split audio with Tools Root</h2><p>A single long recording — a lecture, a long interview, an album ripped as one continuous file — often needs to become several separate files, whether for organizing by topic, sharing individual segments, or fitting a platform's per-file length limits.</p><h2>Multiple split points, all in one pass</h2><p>Rather than trimming and re-uploading repeatedly to get several segments out of one file, set every split point you need at once and export all the resulting pieces together.</p><h2>Common use cases</h2><p>Dividing a long lecture recording into per-topic segments, splitting a continuous album file back into individual tracks, breaking a long interview into shareable clips, or dividing a large voice memo into smaller pieces for easier handling.</p>",
  },
  "split-pdf": {
    howItWorks: {
      title: "How to split a PDF",
      steps: [
        "Upload the PDF you want to split.",
        "Choose how to split it: by page range, by a fixed page count per file, or at every detected bookmark.",
        "Preview the resulting file boundaries in the thumbnail grid.",
        "Download the split files, either individually or as a ZIP.",
      ],
    },
    faq: [
      {
        question: "What are the different ways I can split a PDF here?",
        answer:
          "Three modes are supported: splitting at specific page ranges you define (e.g. pages 1-5 and 6-10 as two files), splitting every N pages into equal chunks, and splitting at each top-level bookmark if the PDF has them.",
      },
      {
        question: "Can I split out just one page instead of ranges?",
        answer:
          "Yes — set a range that starts and ends on the same page number, or use Extract Pages instead if you specifically want to pull a handful of non-contiguous pages into one new file rather than many separate files.",
      },
      {
        question: "How do I download all the split files at once?",
        answer:
          "After processing, you can download each resulting PDF individually or grab all of them together in a single ZIP archive.",
      },
      {
        question: "Does splitting affect the quality of the pages?",
        answer:
          "No. Each output file contains an exact, unmodified copy of the selected pages — same resolution, same embedded fonts, same everything.",
      },
      {
        question: "Will bookmarks still work in the split files?",
        answer:
          "Bookmarks that point to pages within a given split file are preserved in that file. A bookmark pointing to a page that ended up in a different split file won't carry over, since that page no longer exists in the original document.",
      },
      {
        question: "Is there a maximum number of pages I can split?",
        answer:
          "No limit is enforced by the tool itself. Extremely large PDFs are only bounded by your device's available memory, since splitting happens entirely client-side.",
      },
      {
        question: "Can I split a scanned PDF the same way?",
        answer:
          "Yes — splitting works on the page structure regardless of whether the content is scanned images or real text, since it doesn't need to interpret what's on the page, only where the page boundaries are.",
      },
      {
        question: "Is my file uploaded to a server?",
        answer:
          "No. Every operation on this page runs locally in your browser using JavaScript and WebAssembly. Your file is never transmitted anywhere, which also means it works without an internet connection once the page has loaded.",
      },
    ],
    longDescription: "<h2>Why split PDFs with Tools Root</h2><p>Large PDFs often bundle content that needs to be shared or filed separately — a single scanned bundle of receipts, a textbook exported chapter-by-chapter, or a multi-department report that only one team needs one section of. Splitting lets you pull exactly the pages you need without re-scanning or re-exporting anything.</p><h2>Three ways to split, depending on your document</h2><p>Fixed page ranges work well when you already know the exact boundaries you want. Splitting by page count is faster for uniform documents, like breaking a 300-page scan into 30-page chunks for easier handling. Splitting at bookmarks is the most convenient option for documents that already have a logical structure, like an exported book or a slide deck converted to PDF with chapter markers.</p><h2>Common use cases</h2><p>Separating a scanned batch of invoices into one PDF per invoice, breaking a large legal document into sections for different reviewers, pulling a single chapter out of a textbook PDF, or dividing a combined annual report into individual quarterly files.</p>",
  },
  "trim-audio": {
    howItWorks: {
      title: "How to trim an audio file",
      steps: [
        "Upload your audio file.",
        "Set the start and end points on the waveform, or enter exact timestamps.",
        "Preview the trimmed selection before finalizing.",
        "Download the trimmed audio.",
      ],
    },
    faq: [
      {
        question: "Can I preview the trimmed section before downloading?",
        answer:
          "Yes, you can play back your selected range to confirm the start and end points are exactly right before finalizing the trim.",
      },
      {
        question: "How precise can I be with the trim points?",
        answer:
          "You can set start and end points either by dragging on the waveform for a quick visual selection, or by entering exact timestamps for frame-accurate precision.",
      },
      {
        question: "Does trimming re-encode the audio, or just cut it?",
        answer:
          "The audio between your selected start and end points is preserved at its original quality — trimming removes the unwanted portions rather than degrading what remains.",
      },
      {
        question: "Can I trim a file down to just a few seconds?",
        answer:
          "Yes, there's no minimum length restriction — trim down to whatever duration you need, from a full recording down to a short clip.",
      },
      {
        question: "What audio formats can I trim?",
        answer:
          "Common formats including MP3, WAV, AAC, and others are supported for trimming.",
      },
      {
        question: "Is my file uploaded to a server?",
        answer:
          "No. Every operation runs locally in your browser using a real FFmpeg engine compiled to WebAssembly. Your file is never transmitted anywhere.",
      },
    ],
    longDescription: "<h2>Why trim audio with Tools Root</h2><p>Cutting a long recording down to just the relevant portion — removing dead air at the start of a voice memo, isolating a clip from a longer track, or shortening a recording to fit a length limit — is one of the most common audio editing tasks.</p><h2>Waveform-precise trimming</h2><p>Setting trim points visually on the waveform makes it easy to see exactly where a sound starts or a pause happens, while exact timestamp entry covers cases where you already know the precise times you need.</p><h2>Common use cases</h2><p>Cutting silence from the start or end of a voice recording, isolating a specific clip from a longer podcast episode, shortening an audio file to meet a platform's length limit, or trimming a song down to just its intro for use elsewhere.</p>",
  },
  "trim-video": {
    howItWorks: {
      title: "How to trim a video",
      steps: [
        "Upload your video file.",
        "Set the start and end points on the timeline, or enter exact timestamps.",
        "Preview the trimmed selection.",
        "Download the trimmed video.",
      ],
    },
    faq: [
      {
        question: "Can I preview my trim selection before downloading?",
        answer:
          "Yes, you can play back the selected range to confirm the start and end points are exactly right before finalizing.",
      },
      {
        question: "How precise can trim points be?",
        answer:
          "Set start and end points by dragging on the timeline for quick visual trimming, or enter exact timestamps for frame-level precision.",
      },
      {
        question: "Does trimming re-encode the whole video, or just cut out the unwanted parts?",
        answer:
          "The kept portion retains the original video's quality — trimming removes the unselected sections rather than degrading what remains.",
      },
      {
        question: "Can I trim a video down to just a few seconds?",
        answer:
          "Yes, there's no minimum length restriction — trim down to whatever duration you need.",
      },
      {
        question: "What video formats can I trim?",
        answer:
          "Common formats including MP4, MOV, AVI, and others are supported for trimming.",
      },
      {
        question: "Is my video uploaded to a server?",
        answer:
          "No. Every operation runs locally in your browser using a real FFmpeg engine compiled to WebAssembly. Your video is never transmitted anywhere.",
      },
    ],
    longDescription: "<h2>Why trim video with Tools Root</h2><p>Cutting a long video down to just the relevant clip — removing dead time at the start of a screen recording, isolating a highlight from a longer video, or shortening a clip to fit a length limit — is one of the most common video editing tasks.</p><h2>Timeline-precise trimming</h2><p>Setting trim points visually on the timeline makes it easy to see exactly where the content you want begins and ends, while exact timestamp entry covers cases where you already know the precise times you need.</p><h2>Common use cases</h2><p>Cutting a highlight clip out of a longer recording, removing unwanted footage from the start or end of a video, shortening a video to meet a platform's length limit, or isolating a specific moment from a longer screen recording.</p>",
  },
  "txt-to-pdf": {
    howItWorks: {
      title: "How to convert TXT to PDF",
      steps: [
        "Upload your plain text file.",
        "Choose font, size, and page margin preferences.",
        "The tool formats the text cleanly across pages.",
        "Download your PDF.",
      ],
    },
    faq: [
      {
        question: "Does plain text get any formatting applied, or does it look exactly like a text file?",
        answer:
          "The tool applies clean, readable formatting — consistent font, sizing, margins, and proper page breaks — since plain text files have no formatting of their own to preserve; the goal is a well-presented document, not a literal screenshot of the text file.",
      },
      {
        question: "Can I choose the font and size?",
        answer:
          "Yes, font choice, size, and margins are all adjustable before generating the PDF.",
      },
      {
        question: "Will long lines wrap correctly?",
        answer:
          "Yes, text wraps naturally to fit the page width you've configured, rather than being cut off or requiring horizontal scrolling.",
      },
      {
        question: "Does this preserve line breaks from the original text file?",
        answer:
          "Yes, intentional line breaks and paragraph spacing in the source text file are preserved in the PDF layout.",
      },
      {
        question: "What character encodings are supported?",
        answer:
          "Standard UTF-8 encoded text files, which cover the vast majority of modern plain text files including non-English characters, are supported.",
      },
      {
        question: "Is my file uploaded to a server?",
        answer:
          "No. Every operation runs locally in your browser using JavaScript and WebAssembly. Your file is never transmitted anywhere, which also means it works without an internet connection once the page has loaded.",
      },
    ],
    longDescription: "<h2>Why convert TXT to PDF with Tools Root</h2><p>A plain text file — notes, a script's output, exported log data, a simple draft — often needs to become a properly formatted, shareable document rather than a raw .txt that looks different in every text editor it's opened in.</p><h2>Clean, configurable formatting from raw text</h2><p>Since plain text carries no formatting of its own, this tool applies genuinely readable typography: your choice of font, size, and margins, with correct line wrapping and page breaks, turning a flat text dump into a document that's pleasant to read and print.</p><h2>Common use cases</h2><p>Converting exported notes into a shareable PDF, turning a plain-text script or transcript into a formatted document, preparing log file output for an official record, or converting a simple text draft into something presentable to send to someone else.</p>",
  },
  "unlock-pdf": {
    howItWorks: {
      title: "How to unlock a PDF",
      steps: [
        "Upload the password-protected PDF.",
        "Enter the current password.",
        "The tool decrypts and rebuilds the PDF without protection.",
        "Download the unlocked file.",
      ],
    },
    faq: [
      {
        question: "Can this tool remove a password I don't know?",
        answer:
          "No. You need to enter the correct current password for the PDF; this tool removes protection from files you already have rightful access to, it does not attempt to bypass or crack unknown passwords.",
      },
      {
        question: "Why would I need to unlock a PDF I have the password for?",
        answer:
          "Common reasons include needing to edit, merge, or extract pages from a protected file — many other tools require reading the file's content directly, which an unremoved password would block.",
      },
      {
        question: "Does unlocking remove both the open password and permission restrictions?",
        answer:
          "Yes, providing the correct password removes the file's protection entirely, including any printing, copying, or editing restrictions that were set alongside it.",
      },
      {
        question: "Will unlocking change the content of my PDF?",
        answer:
          "No, only the encryption is removed — the underlying pages, text, images, and formatting are otherwise identical to the protected original.",
      },
      {
        question: "Can I re-add a password afterward if I need to share it again?",
        answer:
          "Yes, run the unlocked file through the Password Protect PDF tool to add fresh protection with a new password.",
      },
      {
        question: "Is my password ever transmitted or stored anywhere?",
        answer:
          "No. Decryption happens entirely in your browser — the password you enter and the file itself are never sent to a server.",
      },
    ],
    longDescription: "<h2>Why unlock PDFs with Tools Root</h2><p>A password-protected PDF you have every right to access can still get in the way of routine tasks — merging it with other files, extracting a page, or editing text — since most tools need to read the file's actual content, which encryption blocks by design.</p><h2>Legitimate, password-verified decryption</h2><p>This tool requires the correct existing password before it will decrypt anything; it's built for removing protection from files you already have rightful access to, not for bypassing security on files you don't. The decryption uses a real PDF encryption implementation, the same one used to add protection in the Password Protect PDF tool.</p><h2>Common use cases</h2><p>Removing a password from an old file before merging it into a larger document, unlocking a protected contract you need to extract a signature page from, clearing restrictions on a PDF you own so you can edit it, or preparing a previously protected file for a workflow that can't handle encrypted PDFs.</p>",
  },
  "watermark-image": {
    howItWorks: {
      title: "How to add a watermark to an image",
      steps: [
        "Upload one or more images.",
        "Choose a text or image (logo) watermark.",
        "Adjust position, rotation, opacity, and shadow with a live preview.",
        "Download the watermarked image, or all of them as a ZIP.",
      ],
    },
    faq: [
      {
        question: "Can I use my logo as a watermark instead of text?",
        answer:
          "Yes, both text watermarks (with your choice of wording and font) and image watermarks using an uploaded logo or graphic are supported.",
      },
      {
        question: "Can I control opacity so the watermark isn't too distracting?",
        answer:
          "Yes, opacity is fully adjustable, along with an optional drop shadow to help the watermark stand out against busy backgrounds without needing to be fully opaque.",
      },
      {
        question: "Can I apply the same watermark to many photos at once?",
        answer:
          "Yes, batch watermarking applies your configured watermark (position, opacity, rotation, and all) to every uploaded image in one pass.",
      },
      {
        question: "Where can I position the watermark?",
        answer:
          "Position is freely adjustable, whether that's a corner for a subtle brand mark or a large diagonal watermark across the center to more strongly discourage unauthorized use.",
      },
      {
        question: "Does watermarking affect the underlying photo's quality?",
        answer:
          "The watermark is layered on top of the image; the underlying photo pixels outside the watermark are otherwise unaffected, aside from whatever output quality setting applies to the final saved format.",
      },
      {
        question: "Is my image uploaded to a server?",
        answer:
          "No. Every operation runs locally in your browser using JavaScript and WebAssembly. Your image is never transmitted anywhere, which also means it works without an internet connection once the page has loaded.",
      },
    ],
    longDescription: "<h2>Why watermark images with Tools Root</h2><p>Protecting photos you're sharing publicly — portfolio work, product photos, stock images — from unauthorized reuse, or simply branding images consistently with a logo, is a common need for photographers, designers, and small businesses.</p><h2>Full styling control, applied in batch</h2><p>Position, rotation, opacity, and drop shadow are all adjustable with a live preview, and the same configuration can apply across a whole batch of images at once rather than repeating the setup photo by photo.</p><h2>Common use cases</h2><p>Watermarking portfolio photos before posting them publicly online, branding product photos with a company logo before listing them for sale, adding a copyright notice to stock photography, or marking preview images to discourage use before a client has paid for the final files.</p>",
  },
  "watermark-pdf": {
    howItWorks: {
      title: "How to add a watermark to a PDF",
      steps: [
        "Upload your PDF.",
        "Choose a text or image watermark, then set its content, font, or source image.",
        "Adjust position, rotation, and opacity to preview it live on the page.",
        "Apply the watermark to every page and download the result.",
      ],
    },
    faq: [
      {
        question: "Can I use my own logo image as a watermark, not just text?",
        answer:
          "Yes, both text watermarks (with your choice of wording, font, and color) and image watermarks (using an image you upload, such as a logo) are supported.",
      },
      {
        question: "Can I control how transparent the watermark is?",
        answer:
          "Yes, opacity is adjustable so you can make it subtle enough not to obscure the underlying content, or bold enough to be clearly visible, depending on your purpose.",
      },
      {
        question: "Will the watermark appear on every page, or can I choose specific pages?",
        answer:
          "By default it applies to every page, which covers the common case of marking a whole document as a draft or confidential — this ensures no page can be separated out without the mark.",
      },
      {
        question: "Can I rotate the watermark diagonally across the page?",
        answer:
          "Yes, rotation is adjustable, including the common diagonal placement used for \"DRAFT\" or \"CONFIDENTIAL\" style watermarks.",
      },
      {
        question: "Does adding a watermark affect the underlying text or images?",
        answer:
          "No, the watermark is layered on top of the existing page content without altering it — the original text remains selectable and the original images remain untouched underneath.",
      },
      {
        question: "Can a watermark be removed later if I need to update it?",
        answer:
          "Once applied and downloaded, the watermark becomes part of the page content. If you need to change it, start again from your original unwatermarked file with different settings.",
      },
      {
        question: "Is my file uploaded to a server?",
        answer:
          "No. Every operation on this page runs locally in your browser using JavaScript and WebAssembly. Your file is never transmitted anywhere, which also means it works without an internet connection once the page has loaded.",
      },
    ],
    longDescription: "<h2>Why watermark PDFs with Tools Root</h2><p>Marking a document as a draft, confidential, or property of a particular organization is a routine step before sharing it externally, and it shouldn't require design software just to stamp text or a logo across every page.</p><h2>Full control over placement and appearance</h2><p>Position, rotation, opacity, and font are all adjustable with a live preview, so you can dial in something subtle in a corner or a bold diagonal stamp across the center, depending on whether the goal is branding or an explicit warning.</p><h2>Common use cases</h2><p>Marking a document as \"DRAFT\" before internal review, stamping \"CONFIDENTIAL\" on a document ahead of sharing it outside your organization, adding a company logo to outgoing proposals, or watermarking a sample document to discourage unauthorized redistribution.</p>",
  },
  "watermark-video": {
    howItWorks: {
      title: "How to add a watermark to a video",
      steps: [
        "Upload your video file.",
        "Choose a text or image (logo) watermark.",
        "Position it on the frame and set its opacity.",
        "Download your watermarked video.",
      ],
    },
    faq: [
      {
        question: "Can I use my logo as a video watermark, not just text?",
        answer:
          "Yes, both text watermarks and image watermarks using an uploaded logo or graphic are supported, overlaid consistently across the video's duration.",
      },
      {
        question: "Does the watermark stay in the same position throughout the video?",
        answer:
          "Yes, once positioned, the watermark stays fixed in that location across every frame of the video for the duration you set.",
      },
      {
        question: "Can I control how visible the watermark is?",
        answer:
          "Yes, opacity is adjustable, so you can add a subtle brand mark that doesn't distract from the content, or a bold, clearly visible watermark.",
      },
      {
        question: "Does adding a watermark reduce video quality?",
        answer:
          "The watermark is composited onto the video during encoding; the underlying footage otherwise retains its quality according to your chosen output settings, the same as any video export.",
      },
      {
        question: "How long does watermarking take?",
        answer:
          "Processing time depends on your video's length and resolution and your device's processing power, since the watermark is rendered into the video entirely on your own hardware.",
      },
      {
        question: "Is my video uploaded to a server?",
        answer:
          "No. Every operation runs locally in your browser using a real FFmpeg engine compiled to WebAssembly. Your video is never transmitted anywhere.",
      },
    ],
    longDescription: "<h2>Why watermark video with Tools Root</h2><p>Branding video content consistently, or discouraging unauthorized redistribution of footage you're sharing publicly, are common reasons to add a visible mark across a video before publishing it.</p><h2>Positioned and styled to fit your content</h2><p>Text or logo watermarks can be placed and sized to sit unobtrusively in a corner or more prominently across the frame, with adjustable opacity to control how strongly the mark stands out against the underlying footage.</p><h2>Common use cases</h2><p>Branding a company's video content with a logo before publishing, watermarking preview footage shared with a client before final delivery, adding a copyright mark to original video content shared publicly, or marking sample footage in a portfolio to discourage unauthorized use.</p>",
  },
  "word-to-pdf": {
    howItWorks: {
      title: "How to convert Word to PDF",
      steps: [
        "Upload your DOCX file.",
        "The tool reads the document's real structure — fonts, images, tables, and layout.",
        "A PDF is generated that matches the original document exactly.",
        "Download your PDF.",
      ],
    },
    faq: [
      {
        question: "Will my PDF look exactly like the original Word document?",
        answer:
          "Yes — this tool parses the actual DOCX file structure directly (fonts, sizing, images, tables, and layout) rather than approximating it, so the output PDF preserves the original document's appearance faithfully.",
      },
      {
        question: "What happens to embedded images and tables?",
        answer:
          "Both are preserved in place with their original formatting — images keep their position and size, and tables retain their structure, borders, and cell formatting.",
      },
      {
        question: "Will fonts look the same in the PDF?",
        answer:
          "Yes, font family, size, weight, and styling are read directly from the document and reproduced in the PDF output.",
      },
      {
        question: "Does this work with complex layouts, like multi-column documents?",
        answer:
          "Standard Word layouts including multi-column text, headers and footers, and mixed formatting are supported. Extremely unusual custom layouts may be the exception where some manual review of the result is worthwhile.",
      },
      {
        question: "Can I convert a password-protected Word document?",
        answer:
          "You'll need to remove the password protection in Word first, since this tool needs to read the document's actual content to convert it.",
      },
      {
        question: "Is my document uploaded to a server?",
        answer:
          "No. Every operation runs locally in your browser using JavaScript and WebAssembly. Your document is never transmitted anywhere, which also means it works without an internet connection once the page has loaded.",
      },
    ],
    longDescription: "<h2>Why convert Word to PDF with Tools Root</h2><p>PDF is the standard format for sharing a finished document that shouldn't change on the recipient's end — the layout, fonts, and formatting stay locked in exactly as intended, regardless of what software or device someone opens it with.</p><h2>Real structural parsing, not an approximation</h2><p>This tool parses the DOCX file's actual OOXML structure directly, reading exact font sizes, colors, image positions, and table formatting, rather than relying on a lossy library that discards fine formatting details. That's why fonts, tables, and images come through matching the original precisely.</p><h2>Common use cases</h2><p>Converting a finished resume to PDF before submitting a job application, turning a report into PDF for distribution where formatting must stay fixed, preparing a Word-based contract for signing, or converting meeting notes into PDF for an official record.</p>",
  },

  // --------------------------------------------------- Image Converter (format pairs)
  "jpg-to-png": {
    howItWorks: {
      title: "How to convert JPG to PNG",
      steps: [
        "Upload one or more JPG images.",
        "The output format is already set to PNG — no picker needed.",
        "Click convert to render each image as a lossless PNG.",
        "Download your PNG file, or all of them together as a ZIP.",
      ],
    },
    faq: [
      {
        question: "Why convert a JPG to PNG instead of keeping it as JPG?",
        answer:
          "PNG is a lossless format, so it doesn't introduce the compression artifacts JPG does, and it supports transparency, which JPG can't represent at all. It's the right choice before further editing, or when a destination specifically requires PNG.",
      },
      {
        question: "Will converting my JPG to PNG add transparency to it?",
        answer:
          "No — a JPG has no transparency data to begin with, so the converted PNG will still have a fully opaque background. PNG support for transparency matters starting from a source that already has it, like a PNG or a background-removed image.",
      },
      {
        question: "Will the file size get bigger after converting to PNG?",
        answer:
          "Usually yes. PNG's lossless compression generally produces a larger file than JPG for photographic images, since JPG's lossy compression is specifically tuned to shrink photo-like content more aggressively.",
      },
      {
        question: "Does converting JPG to PNG improve the image quality?",
        answer:
          "No — any quality already lost to JPG's lossy compression during the original save is already baked into the pixels and can't be recovered by switching formats. Converting just stops any further generational loss from future re-saves.",
      },
      {
        question: "Can I convert several JPG files to PNG at once?",
        answer:
          "Yes, batch conversion is supported — upload multiple JPG files and download the converted PNGs individually or together as a ZIP.",
      },
      {
        question: "Is my photo uploaded to a server?",
        answer:
          "No. Conversion runs locally in your browser using JavaScript and WebAssembly. Your image is never transmitted anywhere.",
      },
    ],
    longDescription: "<h2>Why convert JPG to PNG with Tools Root</h2><p>PNG's lossless compression and support for transparency make it the better choice before further editing, or whenever a destination — a design tool, a print workflow, a website that needs a transparent logo — specifically calls for PNG instead of JPG.</p><h2>A dedicated page, the same real engine</h2><p>This page uses the identical browser-based conversion engine as the all-in-one Image Converter, just with PNG pre-selected as the output so there's no format picker to navigate through first.</p><h2>Common use cases</h2><p>Preparing a JPG photo for further editing in software that works better with lossless input, converting a JPG logo to PNG before adding transparency in an image editor, meeting a platform's requirement for PNG uploads specifically, or archiving a photo in a format that won't degrade further on repeated saves.</p>",
  },
  "png-to-jpg": {
    howItWorks: {
      title: "How to convert PNG to JPG",
      steps: [
        "Upload one or more PNG images.",
        "The output format is already set to JPG — no picker needed.",
        "Adjust the quality slider if you want a different size-versus-quality balance.",
        "Download your JPG file, or all of them together as a ZIP.",
      ],
    },
    faq: [
      {
        question: "Why convert PNG to JPG?",
        answer:
          "JPG files are typically much smaller than PNG for photographic content, which matters for faster website loading, smaller email attachments, or meeting a platform's file size limit — at the cost of PNG's lossless quality and transparency support.",
      },
      {
        question: "What happens to transparency in my PNG when I convert to JPG?",
        answer:
          "JPG doesn't support transparency at all, so any transparent areas in the source PNG are filled with a solid background (typically white) in the converted JPG. If you need to keep transparency, PNG or WEBP are better targets.",
      },
      {
        question: "Will I lose quality converting PNG to JPG?",
        answer:
          "Yes, JPG uses lossy compression, so some quality is traded for the smaller file size. The quality slider lets you control exactly how much — higher settings keep more detail at a larger file size, lower settings shrink the file further.",
      },
      {
        question: "How much smaller will the JPG be compared to the original PNG?",
        answer:
          "It varies significantly with image content, but photographic PNGs often shrink substantially when converted to JPG, since JPG's compression is specifically tuned for photo-like detail rather than PNG's flat, lossless encoding.",
      },
      {
        question: "Can I convert a whole batch of PNGs to JPG at once?",
        answer:
          "Yes, upload multiple PNG files and the same quality setting applies to all of them, with results downloadable individually or as a single ZIP.",
      },
      {
        question: "Is my image uploaded to a server?",
        answer:
          "No. Conversion runs locally in your browser using JavaScript and WebAssembly. Your image is never transmitted anywhere.",
      },
    ],
    longDescription: "<h2>Why convert PNG to JPG with Tools Root</h2><p>PNG files, especially for photographic content, are often far larger than they need to be for how the image will actually be used — a JPG at a sensible quality setting looks nearly identical on screen while taking up a fraction of the storage or bandwidth.</p><h2>Quality-adjustable, not a fixed conversion</h2><p>Rather than a single fixed compression level, a quality slider lets you choose exactly how much to trade file size for visual fidelity, so you can find the smallest JPG that still looks right for your use.</p><h2>Common use cases</h2><p>Shrinking a batch of PNG screenshots before attaching them to an email, converting product photos from PNG to JPG to speed up an online store's load time, preparing a photo for a platform with a strict upload size limit, or reducing storage space taken up by a large folder of PNG images.</p>",
  },
  "jpg-to-webp": {
    howItWorks: {
      title: "How to convert JPG to WEBP",
      steps: [
        "Upload one or more JPG photos.",
        "The output format is already set to WEBP — no picker needed.",
        "Adjust the quality slider if you want a different size-versus-quality balance.",
        "Download your WEBP file, or all of them together as a ZIP.",
      ],
    },
    faq: [
      {
        question: "Why convert JPG to WEBP?",
        answer:
          "WEBP generally produces a smaller file than JPG at a comparable visual quality, which is why most modern websites prefer it for faster page loading. It's a direct upgrade in most cases where broad legacy-browser support isn't a concern.",
      },
      {
        question: "Does every browser support WEBP images?",
        answer:
          "Support is very broad across modern browsers, but if you specifically need compatibility with very old software or systems, JPG remains the more universally recognized format.",
      },
      {
        question: "How much smaller is WEBP compared to JPG?",
        answer:
          "It varies by image, but WEBP frequently achieves a meaningfully smaller file size than JPG at a similar visual quality level, which is the main reason websites convert to it for performance.",
      },
      {
        question: "Will converting to WEBP make my photo look worse?",
        answer:
          "At the default quality setting, differences from the source JPG are typically hard to spot on screen. The quality slider lets you fine-tune the tradeoff if you want to prioritize either smaller size or higher fidelity.",
      },
      {
        question: "Can I convert many JPG photos to WEBP at once?",
        answer:
          "Yes, batch conversion is supported — upload multiple JPG files and download the converted WEBP images individually or together as a ZIP.",
      },
      {
        question: "Is my photo uploaded to a server?",
        answer:
          "No. Conversion runs locally in your browser using JavaScript and WebAssembly. Your image is never transmitted anywhere.",
      },
    ],
    longDescription: "<h2>Why convert JPG to WEBP with Tools Root</h2><p>Website performance and page-load speed depend heavily on image file size, and WEBP was specifically designed to beat JPG on that front at a comparable visual quality — which is why it's become the default recommendation for web images.</p><h2>Real WEBP encoding, quality-adjustable</h2><p>Conversion uses the browser's native WEBP encoder with an adjustable quality setting, so you can dial in the exact balance between file size and visual fidelity your use case needs.</p><h2>Common use cases</h2><p>Converting a batch of product photos to WEBP to speed up an e-commerce site, preparing blog images in a smaller format for faster page loads, reducing bandwidth costs for a photo-heavy website, or modernizing an old JPG image library to a more efficient format.</p>",
  },
  "webp-to-png": {
    howItWorks: {
      title: "How to convert WEBP to PNG",
      steps: [
        "Upload one or more WEBP images.",
        "The output format is already set to PNG — no picker needed.",
        "Click convert to render each image as a lossless PNG.",
        "Download your PNG file, or all of them together as a ZIP.",
      ],
    },
    faq: [
      {
        question: "Why would I convert WEBP to PNG?",
        answer:
          "WEBP is efficient but not universally recognized by every piece of older software, some design tools, or certain upload systems that specifically require PNG or JPG. Converting to PNG maximizes compatibility, and preserves transparency if the source WEBP had it.",
      },
      {
        question: "Does the converted PNG keep transparency from the WEBP?",
        answer:
          "Yes, if the source WEBP image includes transparency, that transparency carries over correctly to the converted PNG, since both formats support it.",
      },
      {
        question: "Will the file get bigger after converting to PNG?",
        answer:
          "Generally yes — PNG's lossless compression typically produces a larger file than WEBP's more efficient compression, especially for photographic content.",
      },
      {
        question: "Does converting WEBP to PNG lose any quality?",
        answer:
          "If the source WEBP was saved with lossy compression, that quality loss is already present and won't be reversed by converting formats. If the WEBP was saved losslessly, no further quality is lost in the conversion.",
      },
      {
        question: "Can I convert multiple WEBP images to PNG at once?",
        answer:
          "Yes, batch conversion is supported — upload multiple WEBP files and download the converted PNGs individually or together as a ZIP.",
      },
      {
        question: "Is my image uploaded to a server?",
        answer:
          "No. Conversion runs locally in your browser using JavaScript and WebAssembly. Your image is never transmitted anywhere.",
      },
    ],
    longDescription: "<h2>Why convert WEBP to PNG with Tools Root</h2><p>Not every piece of software or upload system recognizes WEBP yet, and some design and editing workflows specifically expect PNG. Converting closes that compatibility gap while keeping transparency intact.</p><h2>Transparency preserved, lossless output</h2><p>The conversion correctly carries over any transparency present in the source WEBP, and produces a genuinely lossless PNG rather than a re-compressed approximation.</p><h2>Common use cases</h2><p>Converting a WEBP graphic for use in design software that doesn't accept WEBP input, preparing a transparent WEBP logo for a platform that only accepts PNG uploads, maximizing compatibility before sharing an image with someone using older software, or archiving a WEBP image in a more universally recognized format.</p>",
  },
  "heic-to-jpg": {
    howItWorks: {
      title: "How to convert HEIC to JPG",
      steps: [
        "Upload one or more HEIC photos (the default format for recent iPhone photos).",
        "The output format is already set to JPG — no picker needed.",
        "Adjust the quality slider if you want a different size-versus-quality balance.",
        "Download your JPG file, or all of them together as a ZIP.",
      ],
    },
    faq: [
      {
        question: "Why do my iPhone photos need converting from HEIC?",
        answer:
          "HEIC is Apple's default photo format since iOS 11, and while Apple's own devices and recent software handle it fine, a lot of older software, some Windows systems, many websites, and various upload forms still don't recognize it — converting to the near-universal JPG avoids that problem entirely.",
      },
      {
        question: "Does converting HEIC to JPG lose photo quality?",
        answer:
          "Some quality change is inherent to going from HEIC's efficient compression to JPG's compression, but at a reasonable quality setting the difference is generally not noticeable in normal viewing.",
      },
      {
        question: "Can I convert multiple HEIC photos to JPG at once?",
        answer:
          "Yes, batch conversion is supported — upload as many HEIC photos as you need converted, and download them individually or together as a ZIP.",
      },
      {
        question: "Will the converted JPG be smaller or larger than the original HEIC?",
        answer:
          "It depends on the quality setting chosen, but HEIC's compression is generally more space-efficient than JPG's, so the converted JPG is often somewhat larger than the original HEIC file at a comparable visual quality.",
      },
      {
        question: "Does this work for HEIC photos from any iPhone, or only newer models?",
        answer:
          "It works for standard HEIC files regardless of which iPhone model produced them, since HEIC has been Apple's default photo format since iOS 11 across the whole device lineup.",
      },
      {
        question: "What if my HEIC came from a Live Photo or burst shot?",
        answer:
          "A Live Photo or burst HEIC actually contains multiple images bundled together. This tool converts the primary still frame to JPG; the additional frames aren't included in the output. If you specifically need the motion or every burst frame, exporting from the Photos app as a standard photo first, or working from a still frame you've already selected, avoids losing anything unexpected.",
      },
      {
        question: "Is my photo uploaded to a server?",
        answer:
          "No. Conversion runs locally in your browser using JavaScript and WebAssembly. Your photo is never transmitted anywhere.",
      },
    ],
    longDescription: "<h2>Why convert HEIC to JPG with Tools Root</h2><p>An iPhone saves photos as HEIC by default, and while that format is efficient, it isn't recognized everywhere — a work computer running older software, a website upload form, or a colleague on Windows can all run into a photo that simply won't open. Converting to JPG sidesteps that entirely.</p><h2>Real HEIC decoding, not a workaround</h2><p>This tool genuinely decodes HEIC's actual image data before re-encoding it as JPG, rather than relying on a browser's native (often absent) HEIC support — which is why it works consistently regardless of which browser or operating system you're using it from.</p><h2>Common use cases</h2><p>Converting iPhone photos to JPG before uploading them to a website that rejects HEIC files, preparing a batch of vacation photos for a colleague or family member on an older device, making sure photos display correctly across every platform they'll be shared on, or converting an old HEIC photo library into a more universally compatible format.</p>",
  },
  "png-to-webp": {
    howItWorks: {
      title: "How to convert PNG to WEBP",
      steps: [
        "Upload one or more PNG images.",
        "The output format is already set to WEBP — no picker needed.",
        "Adjust the quality slider if you want a different size-versus-quality balance.",
        "Download your WEBP file, or all of them together as a ZIP.",
      ],
    },
    faq: [
      {
        question: "Why convert PNG to WEBP?",
        answer:
          "WEBP typically produces a meaningfully smaller file than PNG while still supporting transparency, which makes it a strong upgrade for website images specifically — faster page loads without losing the transparent background PNG is often chosen for in the first place.",
      },
      {
        question: "Does WEBP keep transparency the same way PNG does?",
        answer:
          "Yes, WEBP fully supports transparency, so a transparent PNG (like a logo or icon) converts to WEBP with its transparent areas intact.",
      },
      {
        question: "How much smaller will my WEBP file be than the PNG?",
        answer:
          "It varies by image content, but WEBP often achieves a considerably smaller file size than PNG, especially for images with a lot of detail, while keeping comparable visual quality.",
      },
      {
        question: "Is WEBP lossy or lossless?",
        answer:
          "WEBP supports both. This tool uses WEBP's lossy mode with an adjustable quality slider, which generally gives the best size savings — if you need guaranteed pixel-perfect output, keeping the source as PNG is the safer choice.",
      },
      {
        question: "Can I convert several PNG files to WEBP at once?",
        answer:
          "Yes, batch conversion is supported — upload multiple PNG files and download the converted WEBP images individually or together as a ZIP.",
      },
      {
        question: "Is my image uploaded to a server?",
        answer:
          "No. Conversion runs locally in your browser using JavaScript and WebAssembly. Your image is never transmitted anywhere.",
      },
    ],
    longDescription: "<h2>Why convert PNG to WEBP with Tools Root</h2><p>PNG is the natural choice for images needing transparency, but its lossless compression means the file is often larger than it needs to be for how the image is actually displayed — particularly on a website, where every kilobyte affects load time.</p><h2>Transparency kept, file size reduced</h2><p>WEBP conversion here preserves any transparency present in the source PNG while applying WEBP's more efficient compression, giving you the same visual capability at a meaningfully smaller file size.</p><h2>Common use cases</h2><p>Converting a transparent PNG logo to WEBP for faster website loading, preparing icon sets in a smaller format for a web app, reducing the file size of PNG graphics across a whole site for better performance, or modernizing a PNG-heavy image library to a more efficient modern format.</p>",
  },
  "svg-to-png": {
    howItWorks: {
      title: "How to convert SVG to PNG",
      steps: [
        "Upload an SVG vector graphic.",
        "The output format is already set to PNG — no picker needed.",
        "Click convert to render the vector as a fixed-resolution PNG.",
        "Download your PNG file.",
      ],
    },
    faq: [
      {
        question: "Why convert SVG to PNG?",
        answer:
          "SVG is a vector format that many platforms — social media, older software, certain email clients, some CMS image fields — don't accept directly. Converting to PNG produces a standard raster image that's universally supported, at the cost of the SVG's infinite scalability.",
      },
      {
        question: "What resolution will the converted PNG be?",
        answer:
          "The PNG is rendered based on the SVG's own defined dimensions. If you need a specific larger size, resizing the SVG's viewBox before conversion, or using the Resize Image tool afterward, gives you control over the final pixel dimensions.",
      },
      {
        question: "Will the PNG look as sharp as the original SVG?",
        answer:
          "At the resolution it's rendered at, yes — the conversion draws the vector precisely at that size. Unlike the SVG itself, though, the resulting PNG is a fixed size and will lose sharpness if scaled up significantly afterward, since raster images don't scale the way vectors do.",
      },
      {
        question: "Does the PNG keep transparency from my SVG?",
        answer:
          "Yes, any transparent areas defined in the SVG carry over correctly to the converted PNG's alpha channel.",
      },
      {
        question: "Can I convert multiple SVG files at once?",
        answer:
          "Yes, batch conversion is supported — upload multiple SVG files and download the converted PNGs individually or together as a ZIP.",
      },
      {
        question: "Is my file uploaded to a server?",
        answer:
          "No. Conversion runs locally in your browser using JavaScript and WebAssembly. Your file is never transmitted anywhere.",
      },
    ],
    longDescription: "<h2>Why convert SVG to PNG with Tools Root</h2><p>SVG's infinite scalability is exactly what makes it awkward for platforms expecting a standard raster image — social media uploaders, older editing software, and many CMS or form fields simply want a fixed-resolution PNG instead.</p><h2>Real vector rendering, not a placeholder</h2><p>This tool genuinely renders the SVG's actual vector paths and fills at its defined dimensions before converting to PNG, rather than treating it as an opaque file — which is why complex vector graphics with gradients, curves, and text come through correctly.</p><h2>Common use cases</h2><p>Converting a logo designed as SVG into PNG for a platform that only accepts raster uploads, preparing a vector icon for use in software that doesn't support SVG import, generating a fixed-size PNG version of a scalable graphic for consistent display, or exporting an SVG illustration for sharing somewhere that expects a standard image file.</p>",
  },
  "avif-to-jpg": {
    howItWorks: {
      title: "How to convert AVIF to JPG",
      steps: [
        "Upload one or more AVIF images.",
        "The output format is already set to JPG — no picker needed.",
        "Adjust the quality slider if you want a different size-versus-quality balance.",
        "Download your JPG file, or all of them together as a ZIP.",
      ],
    },
    faq: [
      {
        question: "Why would I need to convert AVIF to JPG?",
        answer:
          "AVIF is a newer, highly efficient format, but it isn't recognized everywhere yet — some older software, certain editing tools, and various upload systems still expect the far more universally supported JPG instead.",
      },
      {
        question: "Will converting AVIF to JPG make the file bigger?",
        answer:
          "Often yes, since AVIF's compression is generally more space-efficient than JPG's at a comparable visual quality, so gaining broader compatibility usually comes with some increase in file size.",
      },
      {
        question: "Does converting lose image quality?",
        answer:
          "Some change is inherent in re-encoding from one lossy format to another, but at a reasonable quality setting it's typically not noticeable during normal viewing.",
      },
      {
        question: "Can I convert several AVIF images to JPG at once?",
        answer:
          "Yes, batch conversion is supported — upload multiple AVIF files and download the converted JPGs individually or together as a ZIP.",
      },
      {
        question: "Does every browser support opening AVIF files to begin with?",
        answer:
          "Support has grown substantially in modern browsers, but if you're specifically running into software or a platform that can't open an AVIF file at all, converting to JPG resolves that immediately.",
      },
      {
        question: "Is my photo uploaded to a server?",
        answer:
          "No. Conversion runs locally in your browser using JavaScript and WebAssembly. Your image is never transmitted anywhere.",
      },
    ],
    longDescription: "<h2>Why convert AVIF to JPG with Tools Root</h2><p>AVIF is genuinely more efficient than JPG, but that efficiency doesn't help if the software or platform you need to use simply doesn't recognize the format yet. Converting to JPG trades some of that efficiency for support that's effectively universal.</p><h2>Real AVIF decoding, quality-adjustable output</h2><p>The source AVIF is properly decoded before re-encoding, with a quality slider on the JPG output so you can balance file size against visual fidelity for your specific use.</p><h2>Common use cases</h2><p>Converting AVIF images for use in editing software that doesn't yet support the format, preparing photos for an upload system that specifically expects JPG, maximizing compatibility before sharing an image with someone on older software, or converting a batch of AVIF web images back to JPG for a legacy workflow.</p>",
  },
  "gif-to-png": {
    howItWorks: {
      title: "How to convert GIF to PNG",
      steps: [
        "Upload one or more GIF images.",
        "The output format is already set to PNG — no picker needed.",
        "Click convert to capture the GIF's first frame as a static PNG.",
        "Download your PNG file, or all of them together as a ZIP.",
      ],
    },
    faq: [
      {
        question: "What happens to animation when I convert an animated GIF to PNG?",
        answer:
          "PNG is a static image format, so converting an animated GIF captures its first frame only, producing a single still image rather than a moving one. If you specifically need every frame extracted, that's a different kind of tool than a straight format conversion.",
      },
      {
        question: "Why would I want to convert a GIF to PNG?",
        answer:
          "PNG generally gives sharper image quality than GIF, since GIF is limited to a 256-color palette while PNG supports full color depth and true transparency, useful when you need a static image rather than an animation.",
      },
      {
        question: "Will the PNG look better than the original GIF?",
        answer:
          "For the captured frame, potentially yes — PNG's lossless, full-color-depth encoding can represent the frame's color more accurately than GIF's limited palette, though the improvement depends on how much the source image actually needed more than 256 colors.",
      },
      {
        question: "Does the PNG keep transparency from the GIF?",
        answer:
          "Yes, if the source GIF's first frame includes transparency, that transparency carries over to the converted PNG.",
      },
      {
        question: "Can I convert multiple GIF files to PNG at once?",
        answer:
          "Yes, batch conversion is supported — upload multiple GIF files and download the converted PNGs individually or together as a ZIP.",
      },
      {
        question: "Is my file uploaded to a server?",
        answer:
          "No. Conversion runs locally in your browser using JavaScript and WebAssembly. Your file is never transmitted anywhere.",
      },
    ],
    longDescription: "<h2>Why convert GIF to PNG with Tools Root</h2><p>Sometimes what looks like a GIF is really just a static image saved in the wrong format, or only the first frame of an animation is actually needed. Converting to PNG gives you a proper static image with better color depth than GIF's limited palette allows.</p><h2>A clean capture of the first frame</h2><p>The conversion reads the GIF's first frame and re-encodes it as a genuine, lossless PNG, correctly preserving any transparency the frame contains.</p><h2>Common use cases</h2><p>Extracting a static thumbnail image from an animated GIF, converting a non-animated GIF into a more standard PNG format, preparing a still preview image from an animated graphic, or improving color fidelity by moving a GIF's content into PNG's full color depth.</p>",
  },
  "bmp-to-jpg": {
    howItWorks: {
      title: "How to convert BMP to JPG",
      steps: [
        "Upload one or more BMP images.",
        "The output format is already set to JPG — no picker needed.",
        "Adjust the quality slider if you want a different size-versus-quality balance.",
        "Download your JPG file, or all of them together as a ZIP.",
      ],
    },
    faq: [
      {
        question: "Why convert BMP to JPG?",
        answer:
          "BMP files store image data with little to no compression, making them dramatically larger than they need to be for most uses. Converting to JPG can shrink the file drastically, at the cost of BMP's lossless storage.",
      },
      {
        question: "How much smaller will the JPG be than the original BMP?",
        answer:
          "Often dramatically smaller — BMP is essentially uncompressed, so converting to JPG's compressed format frequently reduces file size by a large margin, especially for higher-resolution images.",
      },
      {
        question: "Will I lose quality converting BMP to JPG?",
        answer:
          "Yes, JPG's lossy compression trades some quality for the smaller file size. The quality slider lets you control how much — a high setting keeps the result visually very close to the original BMP.",
      },
      {
        question: "Why do I even have a BMP file in the first place?",
        answer:
          "BMP is an older Windows-native format still produced by some legacy software, certain scanning and imaging tools, and specific technical workflows — it's less commonly the default in modern consumer software.",
      },
      {
        question: "Can I convert multiple BMP files to JPG at once?",
        answer:
          "Yes, batch conversion is supported — upload multiple BMP files and download the converted JPGs individually or together as a ZIP.",
      },
      {
        question: "Is my file uploaded to a server?",
        answer:
          "No. Conversion runs locally in your browser using JavaScript and WebAssembly. Your file is never transmitted anywhere.",
      },
    ],
    longDescription: "<h2>Why convert BMP to JPG with Tools Root</h2><p>BMP stores images with minimal compression, which means even a modest photo can produce a surprisingly large file. Converting to JPG applies real compression tuned for photographic content, often shrinking the file dramatically.</p><h2>Quality-adjustable compression</h2><p>Rather than a single fixed conversion, a quality slider lets you choose exactly how much to compress, so you can find the smallest JPG that still looks right for your use.</p><h2>Common use cases</h2><p>Shrinking an uncompressed BMP scan or screenshot before sharing it, converting legacy BMP images from older software into a modern, compact format, reducing storage space taken up by a folder of BMP files, or preparing a BMP image for a platform that only accepts JPG uploads.</p>",
  },
  "tiff-to-jpg": {
    howItWorks: {
      title: "How to convert TIFF to JPG",
      steps: [
        "Upload one or more TIFF images.",
        "The output format is already set to JPG — no picker needed.",
        "Adjust the quality slider if you want a different size-versus-quality balance.",
        "Download your JPG file, or all of them together as a ZIP.",
      ],
    },
    faq: [
      {
        question: "Why convert TIFF to JPG?",
        answer:
          "TIFF files, common in printing, scanning, and professional photography workflows, are often very large and aren't well supported by web browsers or general-purpose software. Converting to JPG produces a much smaller, near-universally compatible file.",
      },
      {
        question: "Is TIFF support consistent across all browsers?",
        answer:
          "TIFF is not as consistently supported for direct browser viewing as JPG or PNG, which is part of why converting to JPG is useful for anything that needs to display reliably on the web.",
      },
      {
        question: "Will I lose quality converting TIFF to JPG?",
        answer:
          "Yes, JPG's lossy compression trades away some of TIFF's typically lossless quality for a much smaller file. The quality slider lets you keep that loss minimal if fidelity matters for your use.",
      },
      {
        question: "How much smaller will the JPG file be?",
        answer:
          "Often substantially smaller — TIFF files, especially uncompressed or lightly compressed ones from scanners and cameras, can be many times larger than a JPG at a comparable visual quality.",
      },
      {
        question: "Can I convert several TIFF files to JPG at once?",
        answer:
          "Yes, batch conversion is supported — upload multiple TIFF files and download the converted JPGs individually or together as a ZIP.",
      },
      {
        question: "Is my file uploaded to a server?",
        answer:
          "No. Conversion runs locally in your browser using JavaScript and WebAssembly. Your file is never transmitted anywhere.",
      },
    ],
    longDescription: "<h2>Why convert TIFF to JPG with Tools Root</h2><p>TIFF is a mainstay of scanning, printing, and professional photography specifically because of its high-fidelity, often lossless storage — but that same quality makes for large files that browsers and everyday software don't handle as gracefully as JPG.</p><h2>Quality-adjustable, dramatically smaller</h2><p>Converting to JPG with an adjustable quality setting lets you shrink a TIFF scan or photo down to a size that's practical for sharing or web use, while keeping control over exactly how much detail is preserved.</p><h2>Common use cases</h2><p>Converting a high-resolution scanned document from TIFF to a shareable JPG, shrinking professional camera TIFF files for web or email use, preparing a TIFF-based print file for a workflow that expects JPG instead, or reducing storage space taken up by a folder of large TIFF scans.</p>",
  },

  // ---------------------------------------------------- Audio Converter (format pairs)
  "mp4-to-mp3": {
    howItWorks: {
      title: "How to convert MP4 to MP3",
      steps: [
        "Upload your MP4 video file.",
        "The output format is already set to MP3 — no picker needed.",
        "Click extract to pull the audio track out of the video.",
        "Download your MP3 file.",
      ],
    },
    faq: [
      {
        question: "Does converting MP4 to MP3 keep the video too?",
        answer:
          "No — this pulls out only the audio track and discards the video portion entirely, producing a standalone MP3 audio file. If you need to keep both, this isn't the right tool; it's specifically for isolating the sound.",
      },
      {
        question: "Why would I want just the audio from an MP4?",
        answer:
          "Common reasons include turning a recorded video interview into a podcast-ready audio file, pulling a song or soundtrack out of a music video, extracting a lecture's audio for offline listening without the video, or isolating dialogue for editing.",
      },
      {
        question: "Will the audio quality be as good as the original MP4's soundtrack?",
        answer:
          "Extraction preserves the quality present in the source video's audio stream — this doesn't add compression loss beyond what MP3 encoding itself involves, so the result reflects the original recording's actual audio quality.",
      },
      {
        question: "How long can the MP4 file be?",
        answer:
          "There's no artificial length limit imposed by this tool. Processing time and memory use scale with the video's length and your device's own capability, since everything runs on your hardware rather than a shared server.",
      },
      {
        question: "Can I extract audio from more than one MP4 at a time?",
        answer:
          "This tool processes one video at a time to keep the interface simple and focused. For converting many files, running them through one at a time takes just a few clicks each.",
      },
      {
        question: "Is my video uploaded to a server?",
        answer:
          "No. Extraction runs locally in your browser using a real FFmpeg engine compiled to WebAssembly. Your video is never transmitted anywhere.",
      },
    ],
    longDescription: "<h2>Why convert MP4 to MP3 with Tools Root</h2><p>Sometimes only the sound matters — a recorded video interview isn't needed for a podcast release, a music video's soundtrack needs to become a normal audio file, or a lecture recording is more useful as an audio-only file for offline listening. This tool pulls the audio track directly out of an MP4 file.</p><h2>Real stream demuxing, not a re-recording</h2><p>The audio track is extracted directly from the MP4 container using a genuine FFmpeg engine, preserving the original audio quality present in the source rather than approximating it through any kind of re-recording process.</p><h2>Common use cases</h2><p>Turning a recorded video interview into a podcast-ready MP3, pulling a song's audio out of a music video file, extracting a webinar or lecture's audio for offline listening, or isolating a video's dialogue track for further audio editing.</p>",
  },
  "mov-to-mp3": {
    howItWorks: {
      title: "How to convert MOV to MP3",
      steps: [
        "Upload your MOV video file, like footage recorded on an iPhone.",
        "The output format is already set to MP3 — no picker needed.",
        "Click extract to pull the audio track out of the video.",
        "Download your MP3 file.",
      ],
    },
    faq: [
      {
        question: "Why would I need to convert a MOV file to MP3?",
        answer:
          "MOV is the default video format on iPhones and Macs, so when only the audio from an iPhone video matters — a voice memo accidentally recorded as video, a musical performance, spoken notes — extracting it to MP3 gives you a standalone, more broadly usable audio file.",
      },
      {
        question: "Does this keep the original video file intact?",
        answer:
          "Yes, this only reads the audio track out of the MOV file to create a new MP3; it doesn't modify or delete your original video.",
      },
      {
        question: "Will the extracted MP3 sound as good as the audio in the original MOV?",
        answer:
          "The extraction preserves the audio quality already present in the source recording — this step doesn't degrade it beyond the inherent compression of MP3 encoding itself.",
      },
      {
        question: "Can I extract audio from a long MOV video, like a full recorded event?",
        answer:
          "Yes, there's no artificial length limit — processing time depends on the video's length and your device's own performance, since everything runs locally rather than on a remote server.",
      },
      {
        question: "What if my MOV file doesn't actually have an audio track?",
        answer:
          "If the source video was recorded without sound, there's no audio track to extract, and the tool won't be able to produce a meaningful MP3 from it.",
      },
      {
        question: "Is my video uploaded to a server?",
        answer:
          "No. Extraction runs locally in your browser using a real FFmpeg engine compiled to WebAssembly. Your video is never transmitted anywhere.",
      },
    ],
    longDescription: "<h2>Why convert MOV to MP3 with Tools Root</h2><p>MOV is what an iPhone or Mac saves video as by default, and it's common to end up with audio-only content trapped inside a MOV file — a voice memo captured as video by accident, a live performance recording, or spoken notes. This tool pulls just the sound out.</p><h2>Direct extraction from Apple's native format</h2><p>The audio track is demuxed directly from the MOV container using a genuine FFmpeg engine, correctly handling Apple's format without needing any intermediate conversion step first.</p><h2>Common use cases</h2><p>Extracting a voice memo that was accidentally recorded as a MOV video, pulling the audio from an iPhone-recorded live performance, isolating spoken notes captured on video for a text transcript later, or converting a MOV interview recording into a standalone MP3 for easier sharing.</p>",
  },
  "wav-to-mp3": {
    howItWorks: {
      title: "How to convert WAV to MP3",
      steps: [
        "Upload your WAV audio file.",
        "The output format is already set to MP3 — no picker needed.",
        "Click convert to compress the file to MP3.",
        "Download your MP3 file.",
      ],
    },
    faq: [
      {
        question: "Why convert WAV to MP3?",
        answer:
          "WAV files are uncompressed and therefore quite large, while MP3 compresses audio dramatically with only modest quality tradeoffs — useful for sharing over email, uploading somewhere with a size limit, or general listening where the smaller file size matters more than perfect fidelity.",
      },
      {
        question: "How much smaller will the MP3 be than the original WAV?",
        answer:
          "Substantially smaller in most cases — WAV stores audio with no compression at all, so converting to MP3 commonly reduces file size dramatically, often to a small fraction of the original.",
      },
      {
        question: "Will converting to MP3 make the audio sound noticeably worse?",
        answer:
          "MP3 is a lossy format, so some quality is technically lost, but at standard bitrates the difference is generally not obvious during normal listening. It's more likely to matter to an audio engineer doing detailed mixing work than to someone just listening back to a recording.",
      },
      {
        question: "Should I keep my original WAV file after converting?",
        answer:
          "If you might need to edit the audio further, or want the option to convert to a different format later without additional generational loss, keeping the original lossless WAV around is generally a good idea alongside the compressed MP3.",
      },
      {
        question: "Can I convert several WAV files to MP3 at once?",
        answer:
          "This tool processes one file at a time to keep the interface simple. For several files, running each through takes just a few clicks per file.",
      },
      {
        question: "Is my audio file uploaded to a server?",
        answer:
          "No. Conversion runs locally in your browser using a real FFmpeg engine compiled to WebAssembly. Your file is never transmitted anywhere.",
      },
    ],
    longDescription: "<h2>Why convert WAV to MP3 with Tools Root</h2><p>WAV's uncompressed storage is great for editing and production, but it produces files far larger than necessary for ordinary listening, sharing, or uploading. Converting to MP3 shrinks the file dramatically while keeping the audio very listenable.</p><h2>A real FFmpeg encoder, standard bitrate output</h2><p>Conversion uses a genuine FFmpeg build compiled to WebAssembly to encode the MP3, the same underlying engine used by professional audio software, so the result matches what you'd get from installed desktop tools.</p><h2>Common use cases</h2><p>Shrinking a WAV recording before emailing it as an attachment, converting a batch of uncompressed voice memos into smaller MP3 files, preparing a lossless studio recording for casual sharing or streaming, or reducing storage space taken up by a folder of WAV files.</p>",
  },
  "mp3-to-wav": {
    howItWorks: {
      title: "How to convert MP3 to WAV",
      steps: [
        "Upload your MP3 audio file.",
        "The output format is already set to WAV — no picker needed.",
        "Click convert to produce an uncompressed WAV file.",
        "Download your WAV file.",
      ],
    },
    faq: [
      {
        question: "Why convert MP3 to WAV?",
        answer:
          "Some audio editing and production software works better with, or specifically requires, uncompressed WAV input rather than a compressed format like MP3 — converting gets your file into the format those tools expect.",
      },
      {
        question: "Will converting MP3 to WAV improve the audio quality?",
        answer:
          "No — any quality already lost to MP3's lossy compression when the file was originally encoded is already baked into the audio and can't be recovered by converting to WAV. The conversion changes the container and encoding, not the underlying quality ceiling.",
      },
      {
        question: "Will the WAV file be much larger than the original MP3?",
        answer:
          "Yes, typically substantially larger, since WAV stores audio without compression while MP3 is specifically compressed to be small — expect the WAV to be several times the size of the source MP3.",
      },
      {
        question: "Why would editing software prefer WAV over MP3?",
        answer:
          "Uncompressed WAV avoids the generational quality loss that can accumulate from repeatedly decoding and re-encoding a lossy format during multiple rounds of editing, which is part of why production workflows often standardize on WAV internally even if the final output gets compressed later.",
      },
      {
        question: "Can I convert several MP3 files to WAV at once?",
        answer:
          "This tool processes one file at a time to keep the interface simple. For several files, running each through takes just a few clicks per file.",
      },
      {
        question: "Is my audio file uploaded to a server?",
        answer:
          "No. Conversion runs locally in your browser using a real FFmpeg engine compiled to WebAssembly. Your file is never transmitted anywhere.",
      },
    ],
    longDescription: "<h2>Why convert MP3 to WAV with Tools Root</h2><p>Certain audio editing, production, and analysis software either strongly prefers or outright requires uncompressed WAV input, and this gets an MP3 into that format quickly.</p><h2>Genuine decoding and re-encoding</h2><p>The MP3 is properly decoded and written out as standard uncompressed WAV using a real FFmpeg engine, producing a file that opens correctly in any audio software that expects WAV.</p><h2>Common use cases</h2><p>Preparing an MP3 voice recording for import into audio editing software that expects WAV, converting a compressed audio file for use in an audio-processing pipeline that requires uncompressed input, standardizing a mixed collection of audio files into one consistent format for production work, or meeting a specific technical requirement for WAV input.</p>",
  },

  // ---------------------------------------------------- Video Converter (format pairs)
  "mov-to-mp4": {
    howItWorks: {
      title: "How to convert MOV to MP4",
      steps: [
        "Upload your MOV video file, like footage recorded on an iPhone.",
        "The output format is already set to MP4 — no picker needed.",
        "Click convert to re-encode the video as MP4.",
        "Download your MP4 file.",
      ],
    },
    faq: [
      {
        question: "Why convert MOV to MP4?",
        answer:
          "MOV is Apple's native video format, and while it plays fine on Apple devices and much modern software, MP4 is the more universally supported format across older devices, various editing software, and upload systems that may not accept MOV directly.",
      },
      {
        question: "Will converting from MOV to MP4 reduce video quality?",
        answer:
          "Converting for format compatibility alone, without changing resolution or bitrate, generally preserves quality closely, though any conversion between codecs involves some re-encoding.",
      },
      {
        question: "Does the audio track convert along with the video?",
        answer:
          "Yes, the video's original audio track carries over into the converted MP4 file, not just the visual portion.",
      },
      {
        question: "How long does converting a MOV file take?",
        answer:
          "Processing time depends on the video's length, resolution, and your device's own processing power, since encoding happens entirely on your hardware rather than a remote server.",
      },
      {
        question: "Will the MP4 file be a different size than the original MOV?",
        answer:
          "File size can shift somewhat during conversion depending on the specific encoding settings involved, though it's not generally a dramatic change when converting for compatibility alone.",
      },
      {
        question: "Is my video uploaded to a server?",
        answer:
          "No. Conversion runs locally in your browser using a real FFmpeg engine compiled to WebAssembly. Your video is never transmitted anywhere.",
      },
    ],
    longDescription: "<h2>Why convert MOV to MP4 with Tools Root</h2><p>An iPhone or Mac saves video as MOV by default, and while Apple's own ecosystem handles it without issue, plenty of other software, older devices, and upload systems specifically expect MP4 instead. Converting closes that compatibility gap.</p><h2>A real FFmpeg engine, running on your device</h2><p>Video re-encoding uses a genuine FFmpeg build compiled to WebAssembly, the same engine underlying much of the professional video tooling world, so codec support and output quality match what you'd get from installed desktop software.</p><h2>Common use cases</h2><p>Converting an iPhone-recorded MOV video to MP4 before uploading it somewhere that requires broader compatibility, preparing MOV footage for editing software that works more reliably with MP4, sharing Apple-recorded video with someone using non-Apple devices, or standardizing a mixed video library into one consistent, widely-supported format.</p>",
  },
  "mp4-to-gif": {
    howItWorks: {
      title: "How to convert MP4 to GIF",
      steps: [
        "Upload your MP4 video clip — short clips under about 15 seconds work best.",
        "The output format is already set to GIF — no picker needed.",
        "Click convert to render the clip as an animated GIF.",
        "Download your GIF file.",
      ],
    },
    faq: [
      {
        question: "Is there a length limit for converting MP4 to GIF?",
        answer:
          "There's no hard limit enforced, but GIF compresses far less efficiently than real video codecs, so file size grows quickly with length — clips under roughly 15 seconds generally produce the most manageable results.",
      },
      {
        question: "Why is the resulting GIF file so much larger than the source MP4?",
        answer:
          "GIF is a much older, less efficient format than MP4's modern video compression, so even a short clip can produce a comparatively large GIF file — this is inherent to the format, not specific to this conversion.",
      },
      {
        question: "Does the converted GIF include the video's audio?",
        answer:
          "No — GIF is a purely visual format with no audio support at all, so any sound in the source MP4 is dropped entirely in the converted GIF.",
      },
      {
        question: "Will the GIF loop automatically?",
        answer:
          "Yes, animated GIFs are designed to loop continuously by default, which is standard behavior across virtually every platform and viewer that displays them.",
      },
      {
        question: "Can I convert just a portion of a longer MP4 to GIF?",
        answer:
          "This tool converts the full uploaded file. If you only want a specific segment of a longer video, trimming it down first with Trim Video, then converting the shorter clip here, gives you control over exactly what becomes the GIF.",
      },
      {
        question: "Is my video uploaded to a server?",
        answer:
          "No. Conversion runs locally in your browser using a real FFmpeg engine compiled to WebAssembly. Your video is never transmitted anywhere.",
      },
    ],
    longDescription: "<h2>Why convert MP4 to GIF with Tools Root</h2><p>A short, looping animated clip is often more useful for messaging, social sharing, or embedding in a place that doesn't support real video playback — GIF remains the format most universally supported for that specific purpose.</p><h2>Real frame-by-frame encoding</h2><p>The MP4 is genuinely re-encoded frame by frame into GIF's format using a real FFmpeg engine, rather than a simplified approximation, producing a properly looping animated result.</p><h2>Common use cases</h2><p>Turning a short, funny video moment into a shareable GIF for messaging, converting a screen-recording clip into a GIF for a tutorial or bug report, creating a looping animated preview from a longer video, or preparing a reaction clip in the one format that plays everywhere without needing a video player.</p>",
  },
  "avi-to-mp4": {
    howItWorks: {
      title: "How to convert AVI to MP4",
      steps: [
        "Upload your AVI video file.",
        "The output format is already set to MP4 — no picker needed.",
        "Click convert to re-encode the video as MP4.",
        "Download your MP4 file.",
      ],
    },
    faq: [
      {
        question: "Why convert AVI to MP4?",
        answer:
          "AVI is an older container format that isn't as consistently supported by modern software, mobile devices, and web platforms as MP4 is. Converting brings an older video file up to the format most things expect today.",
      },
      {
        question: "Will an old AVI file still play correctly after converting to MP4?",
        answer:
          "Yes, the conversion re-encodes the video's actual content into MP4's format, so the result plays correctly and consistently across modern devices and software, including places the original AVI might not have opened at all.",
      },
      {
        question: "Does converting AVI to MP4 reduce file size?",
        answer:
          "It depends on how the original AVI was encoded, but AVI files, especially older or less efficiently compressed ones, can sometimes shrink meaningfully when converted to MP4's more modern, efficient encoding.",
      },
      {
        question: "Will the video and audio both convert correctly?",
        answer:
          "Yes, both the visual and audio tracks from the source AVI carry over into the converted MP4 file.",
      },
      {
        question: "How long does converting an AVI file take?",
        answer:
          "Processing time depends on the video's length, resolution, and your device's own processing power, since encoding happens entirely on your hardware rather than a remote server.",
      },
      {
        question: "Is my video uploaded to a server?",
        answer:
          "No. Conversion runs locally in your browser using a real FFmpeg engine compiled to WebAssembly. Your video is never transmitted anywhere.",
      },
    ],
    longDescription: "<h2>Why convert AVI to MP4 with Tools Root</h2><p>AVI was once a dominant video format, but modern devices, editing software, and web platforms have largely moved on to MP4 as the default expectation. Converting an old AVI file to MP4 keeps it playable and usable going forward.</p><h2>A real FFmpeg engine, genuine re-encoding</h2><p>Conversion uses a genuine FFmpeg build compiled to WebAssembly to properly decode the AVI's video and audio streams and re-encode them as standard MP4, rather than a simplified container swap that wouldn't actually fix underlying compatibility issues.</p><h2>Common use cases</h2><p>Converting an old AVI video archive into a format that plays on current devices, preparing legacy AVI footage for import into modern editing software, sharing an older video file with someone whose software doesn't open AVI, or standardizing a mixed-format video library into one consistent, modern format.</p>",
  },
  "mkv-to-mp4": {
    howItWorks: {
      title: "How to convert MKV to MP4",
      steps: [
        "Upload your MKV video file.",
        "The output format is already set to MP4 — no picker needed.",
        "Click convert to re-encode the video as MP4.",
        "Download your MP4 file.",
      ],
    },
    faq: [
      {
        question: "Why convert MKV to MP4?",
        answer:
          "MKV is a flexible, feature-rich container popular for high-quality video and multiple audio/subtitle tracks, but it isn't supported as consistently as MP4 across mobile devices, some browsers, and various upload systems. Converting to MP4 maximizes compatibility.",
      },
      {
        question: "Will I lose subtitle or multiple audio tracks converting MKV to MP4?",
        answer:
          "This conversion carries over the video and its primary audio track. MKV's support for multiple embedded subtitle and audio tracks is one of the format's distinguishing features, and a straightforward format conversion focuses on producing a standard playable MP4 rather than preserving every embedded extra track.",
      },
      {
        question: "Does MP4 support the same video quality as MKV?",
        answer:
          "MP4 can contain the same modern video codecs MKV often uses, so quality itself isn't inherently limited by switching containers — the practical benefit of converting is compatibility, not a quality tradeoff either way.",
      },
      {
        question: "Why don't all devices play MKV files directly?",
        answer:
          "MKV support varies more than MP4's across default media players, some mobile devices, and certain web platforms, which is exactly the gap converting to MP4 closes.",
      },
      {
        question: "How long does converting an MKV file take?",
        answer:
          "Processing time depends on the video's length, resolution, and your device's own processing power, since encoding happens entirely on your hardware rather than a remote server.",
      },
      {
        question: "Is my video uploaded to a server?",
        answer:
          "No. Conversion runs locally in your browser using a real FFmpeg engine compiled to WebAssembly. Your video is never transmitted anywhere.",
      },
    ],
    longDescription: "<h2>Why convert MKV to MP4 with Tools Root</h2><p>MKV is a favorite for high-quality video with embedded extras like multiple subtitle tracks, but that flexibility comes at the cost of less consistent support across mobile devices, certain browsers, and various platforms that specifically expect MP4.</p><h2>A real FFmpeg engine, running on your device</h2><p>The MKV's video and audio streams are properly decoded and re-encoded into standard MP4 using a genuine FFmpeg build compiled to WebAssembly, producing a file that plays reliably wherever MP4 is expected.</p><h2>Common use cases</h2><p>Converting a downloaded MKV video for playback on a mobile device that doesn't support it well, preparing MKV footage for upload to a platform that requires MP4, sharing an MKV file with someone whose media player doesn't open it, or standardizing a mixed-format video collection into the most broadly compatible option.</p>",
  },
};

const CATEGORY_NOUN = {
  pdf: { noun: "PDF", article: "a" },
  image: { noun: "image", article: "an" },
  document: { noun: "document", article: "a" },
  audio: { noun: "audio file", article: "an" },
  video: { noun: "video", article: "a" },
  archive: { noun: "archive", article: "an" },
};

function genericHowItWorks(tool) {
  const { noun, article } = CATEGORY_NOUN[tool.category] || { noun: "file", article: "a" };
  return {
    title: `How to ${tool.verb.toLowerCase()} ${article} ${noun}`,
    steps: [
      `Drag and drop your file into the upload area, or click to browse${tool.multiple ? " (you can add more than one)" : ""}.`,
      "Adjust the options to fit what you need.",
      `Click the button to ${tool.verb.toLowerCase()} — processing happens instantly in your browser.`,
      "Download your finished file.",
    ],
  };
}

function genericFaq(tool) {
  return [
    {
      question: `Is ${tool.name} free to use?`,
      answer: `Yes, ${tool.name} is completely free, with no signup, watermark, or file-count limit.`,
    },
    GENERIC_PRIVACY_FAQ,
  ];
}

function genericLongDescription(tool) {
  return `<h2>About ${tool.name}</h2><p>${tool.description} This tool runs entirely in your browser — no file is ever uploaded to a server, which means it's both private and fast, with no waiting on an upload before processing begins.</p>`;
}

export function getToolContent(toolSlug) {
  const tool = getTool(toolSlug);
  if (!tool) return { howItWorks: null, faq: [], longDescription: "" };

  const override = OVERRIDES[toolSlug] || {};
  return {
    howItWorks: override.howItWorks || genericHowItWorks(tool),
    faq: override.faq || genericFaq(tool),
    longDescription: override.longDescription || genericLongDescription(tool),
  };
}
