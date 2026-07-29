# Tools Root

A free, privacy-first file conversion and editing platform. Every one of
its 70 tools — PDF, image, document, audio, video, and archive — runs
entirely in the browser via JavaScript and WebAssembly. No file is ever
uploaded to a server.

## Stack

- **Next.js 15** (App Router) + **React 19**
- **Tailwind v4** + **shadcn/ui**-style components, strict 3-color design
  system (white / black / `#3CB371`)
- **motion** (Framer Motion successor) for animation
- **Zustand** for the shared file-processing state machine

## Engines (all real, no placeholders)

| Domain | Library | Notes |
|---|---|---|
| PDF read/write | `@cantoo/pdf-lib` | Fork of pdf-lib with genuine encrypt/decrypt support (Password Protect + Unlock PDF) |
| PDF parsing/rendering | `pdfjs-dist` | Deep content-model extraction: per-run font styling, real embedded images, real table detection |
| DOCX read | Direct OOXML parse (JSZip + DOMParser) | Not mammoth — mammoth discards exact font size/color by design |
| DOCX write | `docx` | |
| PPTX read | Direct OOXML parse | Same rationale as DOCX |
| PPTX write | `pptxgenjs` | |
| XLSX | `xlsx` (SheetJS) | |
| OCR | `tesseract.js` | Self-hosted worker/core under `/public/vendor/tesseract` |
| Audio/video | `@ffmpeg/ffmpeg` (ffmpeg.wasm) | Self-hosted core under `/public/vendor/ffmpeg`; MT core used when cross-origin-isolated |
| Archives | `jszip` (ZIP) + `7z-wasm` (7Z/TAR/GZ/RAR) | 7z-wasm is the real 7-Zip binary compiled to WASM |
| Background removal | `@imgly/background-removal` | Real ONNX segmentation model; the one tool whose model weights load from a third-party CDN rather than being self-hosted (too large to bundle) |
| HTML/Markdown/TXT to PDF | `html2canvas-pro` + `marked` | Renders via the browser's own layout engine for real CSS fidelity |

## Project structure

```
src/
  app/                         Next.js routes
    [categorySlug]/
      [toolSlug]/page.js       Universal tool page (all 70 tools)
      page.js                  Category listing page
    about/ pricing/ privacy/ terms/ contact/
  components/
    ui/                        shadcn-style primitives
    upload/                    Dropzone, queue, progress, result panels
    tool-page/                 ToolPageShell (the upload-process-result state machine)
    pdf/                       Shared PDF thumbnail grid
  features/
    <category>/<tool>/
      adapter.js               Wires engine + options panel into the shell
      options-panel.jsx        Tool-specific UI (may be absent for no-config tools)
    adapter-registry.js        Dynamic-import map, slug -> adapter
  lib/
    engines/                  All real processing logic, framework-agnostic
      pdf/ image/ media/ archive/ document/ ocr/ docx/
    registry/                 Tool metadata, SEO content, icons
    store/                    Zustand file-processing store
    validation/               File type/size + page-range validation
public/vendor/                Self-hosted WASM/worker assets (pdf.js, tesseract, ffmpeg, 7z)
```

## Adding a new tool

1. Add an entry to `src/lib/registry/tools.js`.
2. Create `src/features/<category>/<slug>/adapter.js` (and `options-panel.jsx`
   if it needs configuration).
3. Register the adapter's dynamic import in `src/features/adapter-registry.js`.

The page route, upload flow, progress UI, and result/download flow are
all generic — no other code changes are needed.

## Known constraints (real, not oversights)

- **RAR creation** isn't offered: RAR's write format is proprietary to
  WinRAR; every compressor, including the real 7-Zip binary this app
  uses, can only extract RAR, never create it.
- **Remove Background** downloads its ML model from IMG.LY's CDN on
  first use (not bundled — the model is tens of MB and would bloat the
  app for everyone, including visitors who never use this one tool).
  OCR language data works the same way, via Tesseract's own CDN.
- Multi-threaded ffmpeg (faster) requires the page to be
  cross-origin-isolated, which needs the COOP/COEP headers configured in
  `next.config.mjs`. If a hosting environment strips custom headers,
  ffmpeg automatically falls back to its single-threaded core.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run start
```
