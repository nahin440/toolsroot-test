export const metadata = {
  title: "Terms of Service",
  description: "The terms governing your use of Tools Root.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-[760px] px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated July 2026</p>

      <div className="mt-10 max-w-none space-y-6 text-sm leading-relaxed text-muted-foreground [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground">
        <section>
          <h2>Using Tools Root</h2>
          <p>
            Tools Root provides file conversion and editing tools that run in your browser. By
            using this site, you agree to use it only for lawful purposes and in a way that does
            not infringe the rights of, or restrict or inhibit the use and enjoyment of the site
            by, anyone else.
          </p>
        </section>

        <section>
          <h2>Your content</h2>
          <p>
            You retain all rights to any files you process using our tools. Since processing
            happens locally in your browser, we never take possession of, host, or gain any rights
            to your file content. You are solely responsible for ensuring you have the necessary
            rights to any content you process, including respecting the copyright and intellectual
            property rights of others.
          </p>
        </section>

        <section>
          <h2>Availability and accuracy</h2>
          <p>
            We aim for every tool to work correctly and reliably, and we test them thoroughly, but
            file conversion inherently involves reproducing complex formats, and we cannot
            guarantee a perfect, pixel-identical result in every case for every possible input
            file. You should review the output of any conversion before relying on it for
            important purposes.
          </p>
          <p>
            We provide the service on an &ldquo;as available&rdquo; basis and may modify, suspend,
            or discontinue any part of it at any time.
          </p>
        </section>

        <section>
          <h2>Prohibited uses</h2>
          <p>
            You may not use Tools Root to process content that is illegal, infringing, or that you
            do not have the right to handle, or to attempt to disrupt, reverse-engineer in a
            harmful way, or overload the service.
          </p>
        </section>

        <section>
          <h2>Paid plans</h2>
          <p>
            Some features may be offered as part of a paid subscription. Pricing and included
            features are described on our pricing page. Subscriptions renew automatically unless
            cancelled, and are billed in advance.
          </p>
        </section>

        <section>
          <h2>Limitation of liability</h2>
          <p>
            Tools Root is provided without warranties of any kind, to the fullest extent
            permitted by law. We are not liable for any indirect, incidental, or consequential
            damages arising from your use of the service, including any loss of data or content.
          </p>
        </section>

        <section>
          <h2>Changes to these terms</h2>
          <p>
            We may update these terms from time to time. Continued use of the site after changes
            are posted constitutes acceptance of the updated terms.
          </p>
        </section>

        <section>
          <h2>Contact</h2>
          <p>Questions about these terms can be sent through our contact page.</p>
        </section>
      </div>
    </div>
  );
}
