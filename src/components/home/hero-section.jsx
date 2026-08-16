export function HeroSection() {
  return (
    <section className="relative isolate z-20">
      <div className="pointer-events-none absolute inset-0 metallic-emerald-loud" />

      <div className="relative mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-16 lg:py-28">
        <div className="text-center lg:text-left">
          <span className="glass-panel inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-white">
            <HiOutlineCheckCircle className="size-3.5" />
            70 tools, entirely free
          </span>

          <h1 className="font-display mx-auto mt-6 max-w-2xl text-4xl font-semibold tracking-tight text-balance text-white sm:text-6xl lg:mx-0">
            Every file tool you need, in one place
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-lg text-balance text-white/85 lg:mx-0">
            Merge, convert, compress, and edit PDFs, images, documents, audio,
            and video. Free, private, and processed entirely in your browser.
          </p>

          <div className="mt-8 flex justify-center lg:justify-start">
            <ToolSearchBar />
          </div>
        </div>

        <div className="hidden lg:block" aria-hidden="true" />
      </div>
    </section>
  );
}