import { createElement } from "react";
import { HiOutlineLockClosed, HiOutlineBolt, HiOutlineGlobeAlt } from "react-icons/hi2";

import { HeroIconFloat } from "@/components/shared/hero-icon-float";
import { FileConversionPattern } from "@/components/illustrations/file-conversion-pattern";

export const metadata = {
  title: "About",
  description: "Why Tools Root exists and how it works.",
  alternates: { canonical: "/about" },
};

const PRINCIPLES = [
  {
    icon: HiOutlineLockClosed,
    title: "Private by architecture",
    description:
      "Every tool runs entirely in your browser. There's no upload step because there's no server-side endpoint to upload to — your files simply never leave your device.",
  },
  {
    icon: HiOutlineBolt,
    title: "Fast because it's local",
    description:
      "No round-trip to a server means processing starts the instant you drop a file, and isn't limited by anyone else's server queue.",
  },
  {
    icon: HiOutlineGlobeAlt,
    title: "No account needed",
    description: "Every tool works immediately, for free, without creating an account or installing anything.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[760px] px-4 py-16 sm:px-6">
      <section className="relative isolate mb-4 -mx-4 overflow-hidden rounded-3xl bg-accent sm:-mx-6 lg:-mx-[190px]">
        <HeroIconFloat>{createElement(PRINCIPLES[0].icon, { className: "size-1/2" })}</HeroIconFloat>
        <div className="relative px-6 py-10 sm:px-10 sm:py-14 lg:max-w-[65%]">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            About Tools Root
          </h1>
          <p className="mt-4 text-lg text-white/85">
            Tools Root is a collection of file conversion and editing tools built on a simple
            premise: your files are yours, and a tool that merges two PDFs shouldn&apos;t need to
            see the inside of either one.
          </p>
        </div>
      </section>

      <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
        {PRINCIPLES.map((p) => (
          <div key={p.title} className="flex flex-col items-start gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-accent-tint text-accent">
              <p.icon className="size-5" />
            </div>
            <h3 className="font-semibold text-foreground">{p.title}</h3>
            <p className="text-sm text-muted-foreground">{p.description}</p>
          </div>
        ))}
      </div>

      <div className="relative mt-16 space-y-4 overflow-hidden rounded-3xl border border-border p-6 text-sm leading-relaxed text-muted-foreground sm:p-8">
        <FileConversionPattern className="pointer-events-none absolute inset-0 size-full" tone="on-white" />
        <div className="relative">
          <h2 className="text-xl font-semibold text-foreground">How the tools actually work</h2>
          <p>
            Every conversion on this site runs using JavaScript and WebAssembly directly in your
            browser tab. PDF operations use a real PDF engine; audio and video tools use a real
            ffmpeg build compiled to WebAssembly — the same underlying engine used by professional
            video tools, just running on your device instead of a server; scanned-document text
            recognition uses Tesseract, a genuine open-source OCR engine, also running locally;
            archive creation and extraction run on the actual 7-Zip binary compiled to WebAssembly.
          </p>
          <p>
            This means the quality of the underlying engines is the same as you&apos;d get from
            desktop software, without the download, and without your files passing through anyone
            else&apos;s server along the way.
          </p>
        </div>
      </div>

      <div className="mt-12 space-y-4 text-sm leading-relaxed text-muted-foreground">
        <h2 className="text-xl font-semibold text-foreground">You can verify this yourself</h2>
        <p>
          The privacy claim on this page isn&apos;t something you have to take on faith. Open your
          browser&apos;s developer tools to the Network tab before running any tool, then process a
          file — for every tool except Remove Background, you&apos;ll see no outgoing request
          carrying your file&apos;s data. Remove Background is the one exception: it fetches a
          machine learning model&apos;s weights from a CDN the first time you use it, since the
          model is too large to bundle with the page. That request carries only the model, never
          your photo.
        </p>
        <p>
          The same applies to OCR PDF, which downloads language-specific recognition data (not your
          document) the first time you use a given language, caching it afterward.
        </p>
      </div>

      <div className="mt-12 space-y-4 text-sm leading-relaxed text-muted-foreground">
        <h2 className="text-xl font-semibold text-foreground">Two honest limitations</h2>
        <p>
          Running everything client-side is a deliberate tradeoff, not a free lunch, and it&apos;s
          worth being upfront about where that tradeoff shows up. Processing speed depends on your
          own device, so a large video compressed on an older laptop will take longer than the same
          file on a fast desktop — there&apos;s no shared server doing the heavy lifting behind the
          scenes. And RAR archive creation isn&apos;t offered, because RAR is a proprietary format
          that only WinRAR&apos;s own software is licensed to write; extracting RAR files you
          already have is fully supported.
        </p>
      </div>
    </div>
  );
}
