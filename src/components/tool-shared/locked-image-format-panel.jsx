"use client";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

const LOSSY_FORMATS = new Set(["jpg", "webp", "avif"]);
const FORMAT_LABELS = { png: "PNG", jpg: "JPG", webp: "WebP", avif: "AVIF", bmp: "BMP", ico: "ICO" };

/**
 * Locked-target-format variant of the image converter's options panel, used
 * by single-format-pair pages (e.g. /image-converter/jpg-to-webp) so the
 * page shows a fixed destination format instead of a redundant "convert to"
 * dropdown that would contradict what the page's title and URL already say.
 */
export function makeLockedImageFormatPanel(targetFormat) {
  function LockedImageFormatPanel({ options, setOptions }) {
    const isLossy = LOSSY_FORMATS.has(targetFormat);

    return (
      <Card className="space-y-4 p-5">
        <div>
          <Label>Output format</Label>
          <div className="mt-1.5 flex h-10 w-full items-center rounded-lg border border-border bg-secondary px-3 text-sm font-medium text-foreground">
            {FORMAT_LABELS[targetFormat] || targetFormat.toUpperCase()}
          </div>
        </div>

        {isLossy && (
          <div>
            <Label>Quality: {Math.round((options.quality ?? 0.9) * 100)}%</Label>
            <Slider
              className="mt-2"
              min={10}
              max={100}
              value={[Math.round((options.quality ?? 0.9) * 100)]}
              onValueChange={([v]) => setOptions({ ...options, quality: v / 100 })}
            />
          </div>
        )}
      </Card>
    );
  }
  return LockedImageFormatPanel;
}
