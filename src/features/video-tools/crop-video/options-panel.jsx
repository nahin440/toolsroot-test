"use client";

import { useState, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export function CropVideoOptionsPanel({ files, options, setOptions }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [videoUrl] = useState(() => URL.createObjectURL(files[0]));

  useEffect(() => () => URL.revokeObjectURL(videoUrl), [videoUrl]);

  const onCropComplete = useCallback(
    (_, croppedAreaPixels) => {
      setOptions((prev) => ({ ...prev, cropBox: croppedAreaPixels }));
    },
    [setOptions]
  );

  return (
    <Card className="space-y-4 p-5">
      <Label>Drag to position the crop area over your video</Label>
      <div className="relative h-96 w-full overflow-hidden rounded-xl bg-secondary">
        <Cropper
          video={videoUrl}
          crop={crop}
          zoom={zoom}
          aspect={16 / 9}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
        />
      </div>
    </Card>
  );
}
