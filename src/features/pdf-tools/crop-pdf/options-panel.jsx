"use client";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

function MarginSlider({ label, value, onChange }) {
  return (
    <div>
      <Label>
        {label}: {value}pt
      </Label>
      <Slider className="mt-2" min={0} max={150} value={[value]} onValueChange={([v]) => onChange(v)} />
    </div>
  );
}

export function CropPdfOptionsPanel({ options, setOptions }) {
  const margins = options.margins || { top: 0, bottom: 0, left: 0, right: 0 };

  function updateMargin(side, value) {
    setOptions({ ...options, margins: { ...margins, [side]: value } });
  }

  return (
    <Card className="space-y-4 p-5">
      <p className="text-sm text-muted-foreground">
        Set how many points to trim from each side of every page. 72pt = 1 inch.
      </p>
      <MarginSlider label="Top" value={margins.top} onChange={(v) => updateMargin("top", v)} />
      <MarginSlider label="Bottom" value={margins.bottom} onChange={(v) => updateMargin("bottom", v)} />
      <MarginSlider label="Left" value={margins.left} onChange={(v) => updateMargin("left", v)} />
      <MarginSlider label="Right" value={margins.right} onChange={(v) => updateMargin("right", v)} />
    </Card>
  );
}
