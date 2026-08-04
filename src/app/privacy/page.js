export const metadata = {
  title: "Privacy Policy",
  description: "How Tools Root handles your files and data. Free to use, with no account or signup required.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-[760px] px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated August 2026</p>

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
          <h2>No account, ever</h2>
          <p>
            Tools Root does not have user accounts, sign-up, or a login of any kind. Every one of
            the 70 tools on this site is free and available to use without providing an email
            address, a password, or any other personal identifier. There is no paid plan, no
            billing, and no payment information collected anywhere on the site.
          </p>
        </section>

        <section>
          <h2>What we do collect</h2>
          <p>
            We use Google Analytics to understand which tools are used and to diagnose errors.
            This covers things like page views, browser type, and approximate location (city or
            country level, derived from IP address). We do not have access to the content of files
            you process, since that content never reaches our servers. Google&apos;s own privacy
            policy governs how it handles the data its analytics script collects on our behalf.
          </p>
        </section>

        <section>
          <h2>Cookies</h2>
          <p>
            We use essential cookies required for the site to function, such as remembering your
            preferences. Google Analytics also sets its own cookies to distinguish unique visitors
            across sessions, as described above. Since there is no account system, we have no
            authentication cookies, and we do not use third-party advertising or tracking cookies
            beyond Google Analytics.
          </p>
        </section>

        <section>
          <h2>Your rights</h2>
          <p>
            Since file content never reaches our servers, there is nothing for us to delete on
            your behalf for that data. It exists only in your browser&apos;s memory during the
            session and is cleared when you close the tab or navigate away. Since there is no
            account system, we hold no personal profile tied to you beyond the analytics data
            described above. If you&apos;d like that analytics data associated with your visits
            addressed, you can contact us or use your browser&apos;s or Google&apos;s own
            opt-out tools for Google Analytics.
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
