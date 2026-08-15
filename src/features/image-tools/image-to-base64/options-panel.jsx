"use client";

import { useEffect, useState } from "react";
import { HiOutlineCheck, HiOutlineClipboard } from "react-icons/hi2";

import { imageToBase64 } from "@/lib/engines/image/image-core";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { formatBytes } from "@/lib/validation/validate-file";

export function ImageToBase64OptionsPanel({ files, options, setOptions }) {
  const [state, setState] = useState({ key: null, value: null });
  const [copied, setCopied] = useState(false);
  const includePrefix = options.includeDataUriPrefix ?? true;

  useEffect(() => {
    if (files.length === 0) return;
    const key = `${files[0]}-${includePrefix}`;
    let cancelled = false;

    imageToBase64(files[0], { includeDataUriPrefix: includePrefix }).then((value) => {
      if (!cancelled) setState({ key, value });
    });

    return () => {
      cancelled = true;
    };
  }, [files, includePrefix]);

  const isCurrent = state.key === `${files[0]}-${includePrefix}`;
  const value = isCurrent ? state.value : null;

  const handleCopy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard permission denied — the text remains selectable in the
      // textarea below, so copying manually still works.
    }
  };

  return (
    <Card className="space-y-4 p-5">
      <div className="flex items-center justify-between">
        <Label className="cursor-pointer" htmlFor="b64-prefix">
          Include data URI prefix (data:image/...;base64,)
        </Label>
        <Switch
          id="b64-prefix"
          checked={includePrefix}
          onCheckedChange={(v) => setOptions({ ...options, includeDataUriPrefix: v })}
        />
      </div>

      {!value ? (
        <div className="h-32 animate-pulse rounded-lg skeleton-shimmer" />
      ) : (
        <div className="space-y-2">
          <textarea
            readOnly
            value={value}
            rows={6}
            className="w-full resize-none rounded-lg border border-border bg-secondary/30 p-3 font-mono text-xs text-foreground"
            onFocus={(e) => e.target.select()}
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{formatBytes(value.length)} of text</span>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 font-medium text-foreground transition-colors hover:border-accent/40"
            >
              {copied ? (
                <HiOutlineCheck className="size-3.5 text-accent-active" />
              ) : (
                <HiOutlineClipboard className="size-3.5" />
              )}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}
