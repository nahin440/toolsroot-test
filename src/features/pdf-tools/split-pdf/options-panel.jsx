"use client";

import { useEffect, useState } from "react";
import { HiOutlinePlus, HiOutlineXMark } from "react-icons/hi2";

import { getPdfPageCount } from "@/lib/engines/pdf/pdf-core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

export function SplitPdfOptionsPanel({ files, options, setOptions }) {
  const [pageCount, setPageCount] = useState(null);
  const mode = options.mode || "every-page";

  useEffect(() => {
    let cancelled = false;
    getPdfPageCount(files[0])
      .then((count) => {
        if (!cancelled) setPageCount(count);
      })
      .catch(() => setPageCount(null));
    return () => {
      cancelled = true;
    };
  }, [files]);

  function setMode(newMode) {
    setOptions({ ...options, mode: newMode, ranges: options.ranges || [{ from: 1, to: pageCount || 1 }] });
  }

  function updateRange(idx, field, value) {
    const ranges = [...(options.ranges || [])];
    ranges[idx] = { ...ranges[idx], [field]: parseInt(value, 10) || 1 };
    setOptions({ ...options, ranges });
  }

  function addRange() {
    const ranges = [...(options.ranges || []), { from: 1, to: pageCount || 1 }];
    setOptions({ ...options, ranges });
  }

  function removeRange(idx) {
    const ranges = (options.ranges || []).filter((_, i) => i !== idx);
    setOptions({ ...options, ranges });
  }

  return (
    <Card className="p-5">
      <p className="text-sm text-muted-foreground">
        {pageCount ? `Your PDF has ${pageCount} pages.` : "Reading page count…"}
      </p>

      <Tabs value={mode} onValueChange={setMode} className="mt-4">
        <TabsList>
          <TabsTrigger value="every-page">Every page</TabsTrigger>
          <TabsTrigger value="every-n">Every N pages</TabsTrigger>
          <TabsTrigger value="ranges">Custom ranges</TabsTrigger>
        </TabsList>

        <TabsContent value="every-page" className="mt-4 text-sm text-muted-foreground">
          Each page becomes its own PDF file.
        </TabsContent>

        <TabsContent value="every-n" className="mt-4 space-y-2">
          <Label htmlFor="every-n-input">Pages per file</Label>
          <Input
            id="every-n-input"
            type="number"
            min={1}
            value={options.everyN || 1}
            onChange={(e) => setOptions({ ...options, everyN: parseInt(e.target.value, 10) || 1 })}
            className="w-32"
          />
        </TabsContent>

        <TabsContent value="ranges" className="mt-4 space-y-3">
          {(options.ranges || []).map((range, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                max={pageCount || undefined}
                value={range.from}
                onChange={(e) => updateRange(idx, "from", e.target.value)}
                className="w-20"
                aria-label={`Range ${idx + 1} start page`}
              />
              <span className="text-sm text-muted-foreground">to</span>
              <Input
                type="number"
                min={1}
                max={pageCount || undefined}
                value={range.to}
                onChange={(e) => updateRange(idx, "to", e.target.value)}
                className="w-20"
                aria-label={`Range ${idx + 1} end page`}
              />
              {(options.ranges || []).length > 1 && (
                <button
                  onClick={() => removeRange(idx)}
                  className="flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary"
                  aria-label={`Remove range ${idx + 1}`}
                >
                  <HiOutlineXMark className="size-4" />
                </button>
              )}
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addRange}>
            <HiOutlinePlus className="size-4" />
            Add range
          </Button>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
