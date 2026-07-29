// Category-level SEO content: a longer intro, a short list of benefits, and a
// small FAQ set for each of the 6 tool categories. Keyed by category key
// (pdf, image, document, audio, video, archive) as returned by getCategoryBySlug().

export const CATEGORY_CONTENT = {
  pdf: {
    intro:
      "PDF is the closest thing to a universal document format — it looks the same on every device, prints predictably, and locks formatting in place. But that same rigidity makes routine tasks like combining files, removing a page, or shrinking a file size feel harder than they should be. This collection covers the full range of everyday PDF work — merging, splitting, compressing, rotating, watermarking, password protection, OCR, signing, and form filling — with every tool running directly in your browser using a real PDF engine, not a simplified approximation. Nothing you upload here is sent to a server.",
    benefits: [
      "Every tool reads and writes real PDF structure, so fonts, tables, and page geometry come through exactly as they were, not flattened or approximated.",
      "Password protection and unlocking use standards-compliant encryption that works in any PDF reader, not just this site.",
      "OCR runs a genuine open-source engine (Tesseract) on-device, so scanned documents become searchable without your file ever leaving your computer.",
      "No file size caps, watermarks, or account requirements on any tool.",
    ],
    faq: [
      {
        question: "Do I need to install anything to edit a PDF here?",
        answer:
          "No — every PDF tool runs directly in your browser tab using JavaScript and WebAssembly. There's nothing to install, and it works the same way on Windows, Mac, Linux, or a tablet.",
      },
      {
        question: "Are my PDFs uploaded to a server when I use these tools?",
        answer:
          "No. All processing — merging, compressing, editing, OCR — happens locally on your device. Your files are never transmitted anywhere, which is also why these tools keep working without an internet connection once the page has loaded.",
      },
      {
        question: "Can I use these tools on a phone or tablet, or only a desktop computer?",
        answer:
          "The tools work on any modern browser, including mobile. Complex page-editing tasks are naturally easier with a larger screen, but nothing here requires a desktop specifically.",
      },
      {
        question: "Which PDF tool should I use to make a scanned document searchable?",
        answer:
          "OCR PDF adds an invisible, searchable text layer over a scanned document's images using on-device optical character recognition, without altering how the page looks.",
      },
      {
        question: "Is there a limit on how many PDFs I can process, or how large they can be?",
        answer:
          "No artificial limits are imposed by these tools. The only real constraint is your own device's available memory, since everything runs client-side rather than on a shared server with usage quotas.",
      },
    ],
  },

  image: {
    intro:
      "Once a photo or graphic is in the right format, it usually still needs work — a website wants a smaller file size, a form wants a cropped passport photo, a portfolio piece needs its background removed, a batch of camera photos needs the GPS metadata stripped before sharing. This collection covers compression, resizing, cropping, rotation, watermarking, background removal, and metadata inspection, all processed locally in your browser rather than uploaded to a server. Looking to change an image's file format instead? That's handled by the dedicated Image Converter category.",
    benefits: [
      "Batch processing across most tools means compressing, resizing, or watermarking dozens of images takes one pass, not one at a time.",
      "Background removal uses a genuine machine learning segmentation model, not a simple color-based cutout.",
      "Image metadata tools let you see exactly what's embedded in a photo — including GPS location — before deciding what to share or strip.",
      "Every edit happens on your device, so nothing is uploaded anywhere, and there's no account or signup required.",
    ],
    faq: [
      {
        question: "Is image format conversion in this category?",
        answer:
          "No — converting between formats like JPG, PNG, WEBP, and HEIC has its own dedicated Image Converter category, with a page for every common format pair. This category covers editing operations: compressing, resizing, cropping, rotating, watermarking, removing backgrounds, and inspecting metadata.",
      },
      {
        question: "Can I process multiple images at once?",
        answer:
          "Yes, batch processing is supported on most tools in this category — upload several images, apply your settings once, and download them individually or together as a ZIP.",
      },
      {
        question: "Are my photos uploaded anywhere when I use these tools?",
        answer:
          "No. All image processing happens directly in your browser. The one exception is Remove Background, where the machine learning model itself (not your photo) downloads from a CDN the first time you use it — your image is never part of that request.",
      },
      {
        question: "Can I check whether a photo contains my location before sharing it?",
        answer:
          "Yes, Image Metadata shows you exactly what's embedded in a photo file, including GPS coordinates if present, camera details, and color profile data — and lets you strip it all in one step if you'd rather not share it.",
      },
      {
        question: "Does compressing or resizing an image change its format?",
        answer:
          "No, these tools keep the image in its original file format — only the file size or dimensions change. Use Image Converter if you also need to switch formats.",
      },
    ],
  },

  imageConverter: {
    intro:
      "Every image format exists for a reason, and none of them is universal — JPG is the default for photos, PNG handles transparency, WEBP shrinks websites, HEIC is what an iPhone saves by default, and SVG only makes sense as a vector graphic. This category covers conversion between all of them: pick an exact format pair below for a page built specifically around that conversion, or use the all-in-one Image Converter if you need more flexibility. Every conversion runs locally in your browser, using real decoding for every source format, including HEIC, SVG, and legacy formats like BMP and TIFF.",
    benefits: [
      "Dedicated pages for the most common conversions — like JPG to WEBP or HEIC to JPG — mean you land exactly where you need to, with the right format already selected.",
      "HEIC support means iPhone photos convert correctly without needing Apple's own software or an intermediate step.",
      "SVG input is genuinely rendered as a vector graphic before rasterizing, not just treated as a broken image file.",
      "Batch conversion on every tool means a whole folder of images converts in one pass, downloaded together as a ZIP.",
    ],
    faq: [
      {
        question: "Should I use a specific format-pair page or the all-in-one Image Converter?",
        answer:
          "Either works identically under the hood. The dedicated pages (like JPG to PNG) are just a faster path when you already know exactly what you need, with the output format pre-selected. The all-in-one Image Converter is better if you want to try several different output formats from the same uploaded file.",
      },
      {
        question: "Can I convert an iPhone photo (HEIC) here?",
        answer:
          "Yes, HEIC to JPG is a dedicated page, and HEIC is also supported as a source format in the all-in-one converter for any other target format you need.",
      },
      {
        question: "Will converting to a lossy format like JPG or WEBP reduce quality?",
        answer:
          "Some quality loss is inherent to lossy compression, but at the default quality setting it's generally not visible on screen. Every lossy target format includes a quality slider so you can choose exactly where to land on the size-versus-quality tradeoff.",
      },
      {
        question: "Are my images uploaded to a server during conversion?",
        answer:
          "No. Every conversion runs locally in your browser using JavaScript and WebAssembly. Your images are never transmitted anywhere, which also means conversion works without an internet connection once the page has loaded.",
      },
      {
        question: "Can I convert several images at once?",
        answer:
          "Yes, every tool in this category supports batch conversion — upload multiple images, and download the results individually or together as a ZIP.",
      },
    ],
  },

  document: {
    intro:
      "Documents move constantly between formats — a resume drafted in Word needs to become PDF for an application, a report exported to PDF needs to become editable again for revisions, a spreadsheet needs a fixed, printable layout, a README written in Markdown needs to become something presentable. This collection covers conversion in both directions between Word, Excel, PowerPoint, PDF, plain text, HTML, and Markdown, using engines that read each format's real internal structure rather than approximating it.",
    benefits: [
      "Word and PowerPoint conversions parse the actual OOXML file structure directly, preserving exact fonts, colors, and layout rather than losing formatting detail the way simpler converters do.",
      "PDF-to-Word and PDF-to-Excel include real table detection, rebuilding genuine editable tables instead of dumping text into a single column.",
      "HTML-to-PDF renders using the browser's own layout engine for real CSS fidelity, not a simplified approximation.",
      "Every conversion runs locally, so sensitive documents like contracts and financial reports never leave your device.",
    ],
    faq: [
      {
        question: "Will converting a Word document to PDF change how it looks?",
        answer:
          "No — this tool parses the DOCX file's actual structure (fonts, images, tables, layout) directly, so the resulting PDF matches the original document's appearance closely.",
      },
      {
        question: "Can I get an editable Word document back from a PDF?",
        answer:
          "Yes, PDF to Word reconstructs text with its original styling, embedded images, and detected tables into a genuinely editable DOCX file. If the source PDF is a scan with no selectable text, on-device OCR runs automatically first.",
      },
      {
        question: "Do these tools handle spreadsheets and presentations, or only text documents?",
        answer:
          "Both directions are covered for Excel and PowerPoint as well — converting spreadsheets and slide decks to PDF, and converting PDFs back into editable spreadsheet or presentation files.",
      },
      {
        question: "Are my documents uploaded to a server during conversion?",
        answer:
          "No. Every document conversion runs locally in your browser using JavaScript and WebAssembly, which matters for sensitive files like contracts, financial statements, or personal records.",
      },
      {
        question: "Can I convert a Markdown file into a nicely formatted document?",
        answer:
          "Yes, Markdown to PDF renders headings, lists, tables, and code blocks with proper visual styling, turning raw Markdown syntax into a properly typeset PDF.",
      },
    ],
  },

  audio: {
    intro:
      "Trimming dead air from a recording, normalizing volume before publishing, merging separate takes into one track, or splitting a long file into segments are quick editing tasks that don't warrant installing dedicated software. This collection runs on a genuine FFmpeg build compiled to WebAssembly, the same engine widely used in professional audio tools, entirely inside your browser. Looking to change an audio file's format, or pull audio out of a video? That's handled by the dedicated Audio Converter category.",
    benefits: [
      "A real FFmpeg engine handles trimming, merging, splitting, and normalization — the same processing quality as installed desktop software.",
      "Waveform-based trimming and splitting make it easy to see exactly where a sound begins or ends before you cut.",
      "Loudness normalization brings recordings to a consistent, appropriate volume without risking distortion from a blunt volume increase.",
      "Nothing is uploaded to a server — audio files, including sensitive voice recordings, are processed entirely on your own device.",
    ],
    faq: [
      {
        question: "Is format conversion or pulling audio from video in this category?",
        answer:
          "No — converting between audio formats and extracting audio from a video file (like MP4 to MP3) both live in the dedicated Audio Converter category. This category covers editing operations on audio you already have: trimming, merging, splitting, and normalizing.",
      },
      {
        question: "Is my audio file uploaded anywhere during processing?",
        answer:
          "No. Every audio tool here runs locally using a real FFmpeg engine compiled to WebAssembly. Your file is never transmitted anywhere.",
      },
      {
        question: "Which tool should I use to fix a recording that's too quiet or too loud?",
        answer:
          "Normalize Audio analyzes the file and adjusts it toward a consistent target loudness, which is a more reliable fix than simply applying a flat volume boost that risks distortion.",
      },
      {
        question: "Can I combine several separate recordings into one file?",
        answer:
          "Yes, Merge Audio joins multiple files into one continuous track in whatever order you set, even if the source files are in different formats.",
      },
      {
        question: "Can I cut one long recording into several separate files?",
        answer:
          "Yes, Split Audio lets you set multiple split points and exports every resulting segment together, useful for dividing a long lecture or interview into shareable pieces.",
      },
    ],
  },

  audioConverter: {
    intro:
      "A podcast platform wants MP3, an audio engineer wants lossless WAV, and a video's soundtrack often needs to become a standalone file entirely. This category covers every direction that conversion goes: pick a dedicated page like MP4 to MP3 for the most common conversions, or use the all-in-one Audio Converter for anything else. Every conversion, including pulling audio out of a video file, runs on a genuine FFmpeg build compiled to WebAssembly, directly in your browser.",
    benefits: [
      "Dedicated pages for the highest-demand conversions — like MP4 to MP3 — mean you land exactly where you need to, with the right output format already set.",
      "Extracting audio from a video file uses real stream demuxing, preserving the original audio quality rather than a lossy re-recording.",
      "The all-in-one Audio Converter covers less common pairs (FLAC, OGG, AIFF, AMR) beyond what a dedicated page targets.",
      "A genuine FFmpeg engine means real codec support and conversion quality matching installed desktop software.",
    ],
    faq: [
      {
        question: "What's the difference between MP4 to MP3 and the all-in-one Audio Converter?",
        answer:
          "MP4 to MP3 is a focused page for the single most common conversion — pulling an MP3 audio track out of an MP4 video file. The all-in-one Audio Converter handles audio-to-audio conversion between eight formats (MP3, WAV, AAC, FLAC, OGG, M4A, AIFF, AMR), and Extract Audio from Video handles any other video source beyond MP4.",
      },
      {
        question: "Can I convert a video file directly to an audio format?",
        answer:
          "Yes — MP4 to MP3, MOV to MP3, and Extract Audio from Video all pull the audio track out of a video file and save it as a standalone audio file, without needing to convert the video itself first.",
      },
      {
        question: "Is my file uploaded to a server during conversion?",
        answer:
          "No. Every conversion runs locally using a real FFmpeg engine compiled to WebAssembly. Your file is never transmitted anywhere.",
      },
      {
        question: "Does converting to MP3 reduce audio quality?",
        answer:
          "MP3 is a lossy format, so converting from a lossless source like WAV does involve some compression. At standard bitrates the difference is not generally noticeable during normal listening, though an audio engineer working on a mix may prefer to stay in a lossless format like WAV until final export.",
      },
      {
        question: "Can I convert the other direction — audio back to a lossless format?",
        answer:
          "Yes, MP3 to WAV converts a compressed MP3 into uncompressed WAV audio, useful for importing into audio editing software that expects a lossless source, though it won't recover detail already lost during the original MP3 compression.",
      },
    ],
  },

  video: {
    intro:
      "Video files are demanding to work with — large, and often need trimming, resizing, or compressing before they'll actually fit where they're going. This collection covers compression, resizing, cropping, trimming, frame rate changes, watermarking, and rotation, all powered by a real FFmpeg build compiled to WebAssembly and running entirely in your browser rather than a remote server. Looking to change a video's file format instead? That's handled by the dedicated Video Converter category.",
    benefits: [
      "A genuine FFmpeg engine handles every operation, delivering the same codec support and encoding quality as installed desktop video software.",
      "Compression and resizing give you direct control over bitrate and dimensions, so you can target a specific file size or platform requirement precisely.",
      "Cropping and rotation apply consistently across the full timeline, giving a clean result rather than a fix that only affects part of the clip.",
      "Large video files never leave your device — everything is processed locally, which also means no upload wait before processing starts.",
    ],
    faq: [
      {
        question: "Is format conversion in this category?",
        answer:
          "No — converting between video formats like MP4, MOV, AVI, and MKV has its own dedicated Video Converter category. This category covers editing operations on a video you already have in the right format: compressing, resizing, cropping, trimming, changing frame rate, watermarking, and rotating.",
      },
      {
        question: "Are large video files uploaded to a server for processing?",
        answer:
          "No. All video processing runs locally in your browser using a real FFmpeg engine compiled to WebAssembly. Your video is never transmitted anywhere, and there's no upload wait before processing begins.",
      },
      {
        question: "How long does it take to process a video?",
        answer:
          "Processing time depends on the video's length, resolution, and your own device's processing power, since encoding happens entirely on your hardware rather than a shared server.",
      },
      {
        question: "Which tool should I use to fit a video under a platform's upload size limit?",
        answer:
          "Compress Video lets you set a target quality and bitrate to shrink file size, and Resize Video can reduce pixel dimensions for an even smaller file if needed.",
      },
      {
        question: "Can I reformat a landscape video into a vertical format for mobile platforms?",
        answer:
          "Yes, Crop Video lets you select a specific frame region — including a vertical 9:16 crop — applied consistently across the entire video.",
      },
    ],
  },

  videoConverter: {
    intro:
      "A MOV file from an iPhone, an old AVI that won't play on a modern device, an MKV that needs to become MP4 for wider support, or a clip that needs to become a GIF for messaging — different destinations expect different video formats. This category covers conversion in every direction: pick a dedicated page like MOV to MP4 for the most common conversions, or use the all-in-one Video Converter for anything else. Every conversion runs on a real FFmpeg build compiled to WebAssembly, directly in your browser.",
    benefits: [
      "Dedicated pages for the highest-demand conversions — like MOV to MP4 and MP4 to GIF — mean you land exactly where you need to, with the right output format already set.",
      "A genuine FFmpeg engine means real codec support and conversion quality matching installed desktop software, not a simplified approximation.",
      "The all-in-one Video Converter covers additional pairs (WEBM, and any combination beyond the dedicated pages) in one flexible tool.",
      "Nothing uploads to a server — conversion happens entirely on your device, so there's no wait for a large video file to upload before processing even starts.",
    ],
    faq: [
      {
        question: "What's the difference between a dedicated page like MOV to MP4 and the all-in-one Video Converter?",
        answer:
          "They use the identical underlying engine. A dedicated page like MOV to MP4 pre-selects the output format for the single most common request; the all-in-one Video Converter lets you pick any target format (MP4, WEBM, AVI, MOV, MKV, or GIF) from any source video in one flexible tool.",
      },
      {
        question: "Can I turn a video clip into a GIF?",
        answer:
          "Yes, MP4 to GIF converts a short video clip into an animated GIF. It works best with clips under roughly 15 seconds, since animated GIFs don't compress nearly as efficiently as real video codecs.",
      },
      {
        question: "Is my video uploaded to a server during conversion?",
        answer:
          "No. Every conversion runs locally using a real FFmpeg engine compiled to WebAssembly. Your video is never transmitted anywhere.",
      },
      {
        question: "Why would I need to convert MOV to MP4?",
        answer:
          "MOV is Apple's default video format from iPhones and Macs, and while many modern platforms handle it fine, some older devices, editing software, and upload systems still expect the more universally supported MP4 instead.",
      },
      {
        question: "Does converting between video formats reduce quality?",
        answer:
          "Converting between two lossy formats does involve re-encoding, which can introduce a small amount of quality loss, though at standard settings it's generally not noticeable. Converting purely for container/format compatibility (like MOV to MP4 without changing resolution) preserves quality closely.",
      },
    ],
  },

  archive: {
    intro:
      "Compressed archives make sharing, uploading, and storing multiple files far more practical than handling them individually. This collection covers both creating and extracting the common archive formats — ZIP, 7Z, TAR, GZ, and RAR — using a real compiled compression engine that runs entirely in your browser.",
    benefits: [
      "Archive creation runs on the actual 7-Zip binary compiled to WebAssembly, producing genuine, standards-compliant archives rather than a simplified reimplementation.",
      "Extraction supports RAR files as well, a proprietary format that's more complex to support but common enough to need reliable handling.",
      "Browse an archive's contents and download just the files you need, without extracting everything.",
      "Files are compressed and extracted entirely on your device, never uploaded to a server.",
    ],
    faq: [
      {
        question: "Which archive formats are supported?",
        answer:
          "ZIP, 7Z, TAR, and GZ can all be created here, and ZIP, RAR, 7Z, TAR, and GZ can all be extracted.",
      },
      {
        question: "Can I create a RAR archive?",
        answer:
          "No — RAR is a proprietary format, and only WinRAR's own software can create RAR files. Every tool, including this one, can extract them, but ZIP, 7Z, TAR, or GZ are the available formats for creating a new archive.",
      },
      {
        question: "Are my files uploaded to a server when I compress or extract an archive?",
        answer:
          "No. Both archive creation and extraction run entirely in your browser using a real compiled compression engine. Your files are never transmitted anywhere.",
      },
      {
        question: "Can I extract just one file from a large archive instead of everything?",
        answer:
          "Yes, Extract Archive lets you browse the archive's contents and download individual files you need, rather than forcing a full extraction of everything inside.",
      },
      {
        question: "Which archive format should I choose when creating one?",
        answer:
          "ZIP is the most universally compatible option and opens natively on nearly every operating system. 7Z typically compresses more tightly but needs dedicated software on some systems. TAR and GZ are common in Unix and Linux environments.",
      },
    ],
  },
};

export function getCategoryContent(categoryKey) {
  return (
    CATEGORY_CONTENT[categoryKey] || {
      intro: "",
      benefits: [],
      faq: [],
    }
  );
}
