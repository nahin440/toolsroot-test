"use client";

import { HiOutlineInformationCircle } from "react-icons/hi2";
import { Card } from "@/components/ui/card";

export function PdfToPdfaOptionsPanel() {
  return (
    <Card className="space-y-3 p-5">
      <div className="flex items-start gap-2.5 rounded-lg bg-secondary/50 p-3.5 text-sm text-muted-foreground">
        <HiOutlineInformationCircle className="mt-0.5 size-4 shrink-0 text-accent-active" />
        <p>
          This embeds a standard sRGB color profile and PDF/A identification metadata into your file
          — the two structural pieces every PDF/A validator checks for first. It targets PDF/A-2b, the
          most widely accepted archival level. For a file that&apos;s already close to PDF/A-clean,
          this is typically all it needs. It can&apos;t guarantee full ISO 19005 conformance for every
          possible source file, since that also depends on things like every font already being
          embedded before upload — full details are in the FAQ below.
        </p>
      </div>
      <p className="text-xs text-muted-foreground">
        Password-protected PDFs can&apos;t be converted, since PDF/A doesn&apos;t allow encryption —
        use Unlock PDF first if needed.
      </p>
    </Card>
  );
}
