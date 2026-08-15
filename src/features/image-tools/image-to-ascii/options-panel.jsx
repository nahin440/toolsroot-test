"use client";

import { useEffect, useState } from "react";
import { HiOutlineExclamationTriangle } from "react-icons/hi2";

import { imageToAscii } from "@/lib/engines/image/image-core";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

export function ImageToAsciiOptionsPanel({ files, options, setOptions }) {
  const [state, setState] = useState({ key: null, art: null, error: null });
  const columns = options.columns || 100;
  const colorMode = options.colorMode ?? true;

  useEffect(() => {
    if (files.length === 0) return;
    const key = `${files[0]}-${columns}`;
    let cancelled = false;

    imageToAscii(files[0], { columns })
      .then((art) => {
        if (!cancelled) setState({ key, art, error: null });
      })
      .catch((e) => {
        if (!cancelled) setState({ key, art: null, error: e?.message || "Couldn't render this image." });
      });

    return () => {
      cancelled = true;
    };
  }, [files, columns]);

  const isCurrent = state.key === `${files[0]}-${columns}`;
  const art = isCurrent ? state.art : null;
  const error = isCurrent ? state.error : null;

  return (
    <Card className="space-y-4 p-5">
      <div>
        <Label>Width: {columns} characters</Label>
        <Slider
          className="mt-2"
          min={40}
          max={220}
          step={10}
          value={[columns]}
          onValueChange={([v]) => setOptions({ ...options, columns: v })}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label className="cursor-pointer" htmlFor="ascii-color">
          Color preview (download is always plain text)
        </Label>
        <Switch
          id="ascii-color"
          checked={colorMode}
          onCheckedChange={(v) => setOptions({ ...options, colorMode: v })}
        />
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-lg bg-primary/10 p-3 text-sm text-primary">
          <HiOutlineExclamationTriangle className="size-4 shrink-0" />
          {error}
        </div>
      ) : !art ? (
        <div className="h-40 animate-pulse rounded-lg skeleton-shimmer" />
      ) : (
        <div className="max-h-[360px] overflow-auto rounded-lg bg-black p-3">
          {colorMode ? (
            <div
              className="whitespace-pre font-mono text-[6px] leading-[7px]"
              dangerouslySetInnerHTML={{ __html: art.html }}
            />
          ) : (
            <pre className="whitespace-pre font-mono text-[6px] leading-[7px] text-white">{art.text}</pre>
          )}
        </div>
      )}
    </Card>
  );
}
