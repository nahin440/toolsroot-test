"use client";

import { useEffect, useState } from "react";
import { HiOutlineCheck, HiOutlineClipboard, HiOutlineExclamationTriangle } from "react-icons/hi2";

import { extractColorPalette } from "@/lib/engines/image/image-core";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

function Swatch({ color }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(color.hex);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access can be denied by browser permissions — the hex
      // value is still visible as text, so this fails silently rather
      // than blocking the rest of the palette from being usable.
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="group flex flex-col items-stretch overflow-hidden rounded-xl border border-border/70 transition-transform hover:scale-[1.02]"
    >
      <div className="h-16 w-full" style={{ backgroundColor: color.hex }} />
      <div className="flex items-center justify-between gap-2 bg-secondary/40 px-2.5 py-1.5">
        <span className="font-mono text-xs font-medium text-foreground">{color.hex}</span>
        {copied ? (
          <HiOutlineCheck className="size-3.5 shrink-0 text-accent-active" />
        ) : (
          <HiOutlineClipboard className="size-3.5 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100" />
        )}
      </div>
    </button>
  );
}

export function ImageColorPaletteOptionsPanel({ files, options, setOptions }) {
  const [state, setState] = useState({ key: null, palette: null, error: null });
  const count = options.count || 6;

  useEffect(() => {
    if (files.length === 0) return;
    const key = `${files[0]}-${count}`;
    let cancelled = false;

    extractColorPalette(files[0], count)
      .then((palette) => {
        if (!cancelled) setState({ key, palette, error: null });
      })
      .catch((e) => {
        if (!cancelled) setState({ key, palette: null, error: e?.message || "Couldn't read this image." });
      });

    return () => {
      cancelled = true;
    };
  }, [files, count]);

  const isCurrent = state.key === `${files[0]}-${count}`;
  const palette = isCurrent ? state.palette : null;
  const error = isCurrent ? state.error : null;

  return (
    <Card className="space-y-4 p-5">
      <div>
        <Label>Colors to extract: {count}</Label>
        <Slider
          className="mt-2"
          min={3}
          max={12}
          value={[count]}
          onValueChange={([v]) => setOptions({ ...options, count: v })}
        />
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-lg bg-primary/10 p-3 text-sm text-primary">
          <HiOutlineExclamationTriangle className="size-4 shrink-0" />
          {error}
        </div>
      ) : !palette ? (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl skeleton-shimmer" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {palette.map((color, i) => (
              <Swatch key={i} color={color} />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Click any swatch to copy its hex code. Colors are ordered from most to least dominant in
            the image.
          </p>
        </>
      )}
    </Card>
  );
}
