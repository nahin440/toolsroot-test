export const metadata = {
  title: "Privacy Policy",
  description: "How Tools Root handles your files and data.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-[760px] px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated July 2026</p>

      <div className="mt-10 max-w-none space-y-6 text-sm leading-relaxed text-muted-foreground [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-foreground">
        <section>
          <h2>How your files are processed</h2>
          <p>
            Every conversion, compression, and editing tool on Tools Root runs entirely inside your
            own browser, using JavaScript and WebAssembly. When you upload a file to a tool on this
            site, that file is read directly by your browser and is never transmitted to our
            servers, or to any third-party server, for the purpose of processing it. This is a
            structural property of how the site is built, not a policy we could quietly change:
            there is no server-side upload endpoint for file content to begin with.
          </p>
          <p>
            One narrow exception exists for the Remove Background tool, which downloads a
            machine-learning model (not your file) from a third-party CDN the first time you use
            it, so that the recognition model itself can run locally afterward. Your image is not
            part of that request. Similarly, the OCR tool downloads language data (not your file)
            the first time you use a given language.
          </p>
        </section>

        <section>
          <h2>What we do collect</h2>
          <p>
            We use standard, privacy-respecting web analytics to understand which tools are used
            and to diagnose errors — this covers things like page views, browser type, and
            approximate location (city/country level, derived from IP address, which is not
            stored alongside the rest of the analytics event). We do not have access to the
            content of files you process, since that content never reaches our servers.
          </p>
        </section>

        <section>
          <h2>Cookies</h2>
          <p>
            We use essential cookies required for the site to function (such as remembering your
            preferences) and, if you&apos;re on a paid plan, an authentication cookie to keep you
            signed in. We do not use third-party advertising or tracking cookies.
          </p>
        </section>

        <section>
          <h2>Third-party services</h2>
          <p>
            If you create an account or subscribe to a paid plan, we use a payment processor to
            handle billing; we never see or store your full payment card details ourselves. Any
            such processor is bound by its own privacy and security obligations for the payment
            data it handles.
          </p>
        </section>

        <section>
          <h2>Your rights</h2>
          <p>
            Since file content never reaches our servers, there is nothing for us to delete on
            your behalf for that data — it exists only in your browser&apos;s memory during the
            session and is cleared when you close the tab or navigate away. For any account or
            billing data we do hold, you can request access, correction, or deletion at any time
            by contacting us.
          </p>
        </section>

        <section>
          <h2>Changes to this policy</h2>
          <p>
            If this policy changes in a way that affects how your data is handled, we&apos;ll update
            the date at the top of this page and, for material changes, note it prominently on
            the site.
          </p>
        </section>

        <section>
          <h2>Contact</h2>
          <p>Questions about this policy can be sent through our contact page.</p>
        </section>
      </div>
    </div>
  );
}
