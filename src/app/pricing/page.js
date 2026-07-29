import Link from "next/link";
import { HiCheck } from "react-icons/hi2";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata = {
  title: "Pricing",
  description: "Tools Root is free to use, with no hidden limits.",
  alternates: { canonical: "/pricing" },
};

const FEATURES = [
  "All 70 tools, unlimited use",
  "No file size caps beyond your device's own memory",
  "No watermarks on output files",
  "No signup or account required",
  "Every file processed locally in your browser",
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-[720px] px-4 py-16 text-center sm:px-6">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Simple pricing: free
      </h1>
      <p className="mx-auto mt-4 max-w-lg text-lg text-muted-foreground">
        Every tool runs in your browser rather than on our servers, so there&apos;s no per-file
        cost for us to pass on to you.
      </p>

      <Card className="mx-auto mt-10 max-w-sm p-8 text-left">
        <p className="text-sm font-medium text-muted-foreground">Tools Root</p>
        <p className="mt-2 text-4xl font-semibold text-foreground">
          $0<span className="text-base font-normal text-muted-foreground">/forever</span>
        </p>
        <ul className="mt-6 space-y-3">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-sm text-foreground">
              <HiCheck className="mt-0.5 size-4 shrink-0 text-accent" />
              {f}
            </li>
          ))}
        </ul>
        <Button asChild variant="accent" className="mt-8 w-full">
          <Link href="/pdf-tools">Start using Tools Root</Link>
        </Button>
      </Card>

      <p className="mt-10 text-sm text-muted-foreground">
        Have a use case that needs something beyond what&apos;s here?{" "}
        <Link href="/contact" className="text-accent hover:underline">
          Get in touch
        </Link>
        .
      </p>
    </div>
  );
}
