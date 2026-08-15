"use client";

import { HiOutlineInformationCircle } from "react-icons/hi2";

import { formatBytes } from "@/lib/validation/validate-file";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SIZE_PRESETS = [
  { value: 10 * 1024 * 1024, label: "10 MB" },
  { value: 25 * 1024 * 1024, label: "25 MB" },
  { value: 50 * 1024 * 1024, label: "50 MB" },
  { value: 100 * 1024 * 1024, label: "100 MB" },
  { value: 700 * 1024 * 1024, label: "700 MB (CD-sized)" },
];

export function SplitArchiveOptionsPanel({ files, options, setOptions }) {
  const maxPartSize = options.maxPartSizeBytes || SIZE_PRESETS[2].value;
  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  const estimatedParts = Math.max(1, Math.ceil(totalSize / maxPartSize));

  return (
    <Card className="space-y-4 p-5">
      <div>
        <Label>Maximum size per part</Label>
        <Select
          value={String(maxPartSize)}
          onValueChange={(v) => setOptions({ ...options, maxPartSizeBytes: Number(v) })}
        >
          <SelectTrigger className="mt-1.5 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SIZE_PRESETS.map((s) => (
              <SelectItem key={s.value} value={String(s.value)}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-xs text-muted-foreground">
        {files.length} file{files.length === 1 ? "" : "s"} ({formatBytes(totalSize)} total) will split
        into approximately {estimatedParts} part{estimatedParts === 1 ? "" : "s"}.
      </p>

      <div className="flex items-start gap-2.5 rounded-lg bg-secondary/50 p-3.5 text-sm text-muted-foreground">
        <HiOutlineInformationCircle className="mt-0.5 size-4 shrink-0 text-accent-active" />
        <p>
          Every part is needed together to reconstruct the original archive — a single part on its own
          can&apos;t be opened. Keep all downloaded parts in the same folder, then extract from the
          first one (.001) using 7-Zip or another tool that supports multi-part archives.
        </p>
      </div>
    </Card>
  );
}
