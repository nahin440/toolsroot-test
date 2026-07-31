import { createElement } from "react";
import { HiOutlineEnvelope } from "react-icons/hi2";

import { HeroIconFloat } from "@/components/shared/hero-icon-float";
import { SocialLinks } from "@/components/shared/social-links";

export const metadata = {
  title: "Contact",
  description: "Get in touch with the Tools Root team.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-[600px] px-4 py-16 sm:px-6">
      <section className="relative isolate mb-8 -mx-4 overflow-hidden rounded-3xl bg-accent sm:-mx-6">
        <HeroIconFloat className="absolute top-1/2 right-[10%] flex size-20 -translate-y-1/2 items-center justify-center rounded-2xl bg-white/10 text-white ring-1 ring-white/20 backdrop-blur-sm sm:size-24">
          {createElement(HiOutlineEnvelope, { className: "size-1/2" })}
        </HeroIconFloat>
        <div className="relative px-6 py-8 sm:px-10 lg:max-w-[70%]">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-white">Contact us</h1>
          <p className="mt-3 text-lg text-white/85">
            Questions, feedback, or something not working the way it should? We&apos;d like to hear
            about it.
          </p>
        </div>
      </section>

      <div className="mt-8 flex items-center gap-3 rounded-2xl border border-border bg-card p-5">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent-tint text-accent">
          <HiOutlineEnvelope className="size-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Email us</p>
          <a href="mailto:hello@toolsroot.com" className="text-sm text-accent hover:underline">
            hello@toolsroot.com
          </a>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-5">
        <div>
          <p className="text-sm font-medium text-foreground">Follow us</p>
          <p className="text-sm text-muted-foreground">Updates and new tools, as they ship.</p>
        </div>
        <SocialLinks />
      </div>

      <p className="mt-8 text-sm text-muted-foreground">
        Since every file you process stays on your own device, we won&apos;t be able to see the
        contents of any file you had trouble with — if you run into an issue with a specific tool,
        it helps to describe what the input file looked like (format, roughly how large, any
        unusual formatting) rather than attaching it.
      </p>
    </div>
  );
}
