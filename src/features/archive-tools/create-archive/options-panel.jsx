"use client";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const FORMATS = [
  { value: "zip", label: "ZIP" },
  { value: "7z", label: "7Z" },
  { value: "tar", label: "TAR" },
  { value: "gztar", label: "TAR.GZ" },
];

export function CreateArchiveOptionsPanel({ options, setOptions }) {
  return (
    <Card className="p-5">
      <Label>Archive format</Label>
      <Select value={options.format || "zip"} onValueChange={(v) => setOptions({ ...options, format: v })}>
        <SelectTrigger className="mt-1.5 w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {FORMATS.map((f) => (
            <SelectItem key={f.value} value={f.value}>
              {f.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="mt-2 text-xs text-muted-foreground">
        RAR isn&apos;t offered here since it&apos;s a proprietary format that only WinRAR&apos;s own software can
        create — every other tool, including this one, can only extract RAR files.
      </p>
    </Card>
  );
}
