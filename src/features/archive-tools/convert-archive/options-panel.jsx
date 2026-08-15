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

function extOf(name) {
  return (name.split(".").pop() || "").toLowerCase();
}

export function ConvertArchiveOptionsPanel({ files, options, setOptions }) {
  const sourceExt = extOf(files[0].name);
  const availableTargets = FORMATS.filter((f) => f.value !== sourceExt);
  const target = options.targetFormat || availableTargets[0]?.value;

  return (
    <Card className="p-5">
      <Label>Convert to</Label>
      <Select value={target} onValueChange={(v) => setOptions({ ...options, targetFormat: v })}>
        <SelectTrigger className="mt-1.5 w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {availableTargets.map((f) => (
            <SelectItem key={f.value} value={f.value}>
              {f.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="mt-2 text-xs text-muted-foreground">
        Your archive is fully extracted, then recompressed in the new format — every file inside is
        preserved exactly.
      </p>
    </Card>
  );
}
