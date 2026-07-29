"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ASPECT_PRESETS = [
  { value: "free", label: "Freeform", aspect: null },
  { value: "1:1", label: "Square (1:1)", aspect: 1 },
  { value: "4:3", label: "Standard (4:3)", aspect: 4 / 3 },
  { value: "16:9", label: "Widescreen (16:9)", aspect: 16 / 9 },
  { value: "3:2", label: "Photo (3:2)", aspect: 3 / 2 },
];

export function CropImageOptionsPanel({ files, options, setOptions }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [imageUrl] = useState(() => URL.createObjectURL(files[0]));
  const aspectKey = options.aspectKey || "free";
  const preset = ASPECT_PRESETS.find((p) => p.value === aspectKey);

  const onCropComplete = useCallback(
    (_, croppedAreaPixels) => {
      setOptions((prev) => ({ ...prev, cropBox: croppedAreaPixels }));
    },
    [setOptions]
  );

  return (
    <Card className="space-y-4 p-5">
      <div>
        <Label>Aspect ratio</Label>
        <Select value={aspectKey} onValueChange={(v) => setOptions({ ...options, aspectKey: v })}>
          <SelectTrigger className="mt-1.5 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ASPECT_PRESETS.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="relative h-96 w-full overflow-hidden rounded-xl bg-secondary">
        <Cropper
          image={imageUrl}
          crop={crop}
          zoom={zoom}
          aspect={preset?.aspect || 4 / 3}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
        />
      </div>

      <div>
        <Label>Zoom</Label>
        <Slider className="mt-2" min={100} max={300} value={[zoom * 100]} onValueChange={([v]) => setZoom(v / 100)} />
      </div>
    </Card>
  );
}
