"use client";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const LANGUAGES = [
  { value: "eng", label: "English" },
  { value: "spa", label: "Spanish" },
  { value: "fra", label: "French" },
  { value: "deu", label: "German" },
  { value: "por", label: "Portuguese" },
  { value: "ben", label: "Bangla" },
  { value: "hin", label: "Hindi" },
  { value: "ara", label: "Arabic" },
  { value: "chi_sim", label: "Chinese (Simplified)" },
];

export function OcrPdfOptionsPanel({ options, setOptions }) {
  return (
    <Card className="p-5">
      <Label>Document language</Label>
      <Select value={options.lang || "eng"} onValueChange={(v) => setOptions({ ...options, lang: v })}>
        <SelectTrigger className="mt-1.5 w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {LANGUAGES.map((l) => (
            <SelectItem key={l.value} value={l.value}>
              {l.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="mt-2 text-xs text-muted-foreground">
        Recognition data for the selected language downloads once and is cached by your browser.
      </p>
    </Card>
  );
}
