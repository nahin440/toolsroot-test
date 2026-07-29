"use client";

import { useEffect, useState } from "react";

import { readImageMetadata } from "@/lib/engines/image/image-core";
import { formatBytes } from "@/lib/validation/validate-file";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function ImageMetadataOptionsPanel({ files, options, setOptions }) {
  const [metadata, setMetadata] = useState(null);

  useEffect(() => {
    readImageMetadata(files[0]).then(setMetadata);
  }, [files]);

  return (
    <Card className="space-y-4 p-5">
      {!metadata ? (
        <div className="h-24 animate-pulse rounded-lg skeleton-shimmer" />
      ) : (
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-muted-foreground">Dimensions</dt>
            <dd className="font-medium text-foreground">
              {metadata.width} × {metadata.height}px
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">File size</dt>
            <dd className="font-medium text-foreground">{formatBytes(metadata.fileSize)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Format</dt>
            <dd className="font-medium text-foreground">{metadata.mimeType || "Unknown"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Contains EXIF data</dt>
            <dd className="font-medium text-foreground">{metadata.hasExif ? "Yes" : "No"}</dd>
          </div>
        </dl>
      )}

      <div className="flex items-center justify-between border-t border-border pt-4">
        <Label htmlFor="strip-metadata" className="font-normal">
          Strip all metadata and download a clean copy
        </Label>
        <Switch
          id="strip-metadata"
          checked={options.strip ?? false}
          onCheckedChange={(v) => setOptions({ ...options, strip: v })}
        />
      </div>
    </Card>
  );
}
