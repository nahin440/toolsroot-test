"use client";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

/**
 * Locked-target-format variant of the audio/video converter's options panel,
 * for single-conversion pages (e.g. /audio-converter/mp4-to-mp3) where the
 * output format is fixed by the page itself rather than user-selectable.
 */
export function makeLockedMediaFormatPanel(targetFormat, note) {
  function LockedMediaFormatPanel() {
    return (
      <Card className="space-y-2 p-5">
        <Label>Output format</Label>
        <div className="flex h-10 w-full items-center rounded-lg border border-border bg-secondary px-3 text-sm font-medium text-foreground">
          {targetFormat.toUpperCase()}
        </div>
        {note && <p className="text-xs text-muted-foreground">{note}</p>}
      </Card>
    );
  }
  return LockedMediaFormatPanel;
}
