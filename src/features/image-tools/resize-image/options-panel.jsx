"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";

export function ResizeImageOptionsPanel({ options, setOptions }) {
  const mode = options.mode || "exact";

  return (
    <Card className="p-5">
      <Tabs value={mode} onValueChange={(v) => setOptions({ ...options, mode: v })}>
        <TabsList>
          <TabsTrigger value="exact">Exact size</TabsTrigger>
          <TabsTrigger value="percentage">Percentage</TabsTrigger>
        </TabsList>

        <TabsContent value="exact" className="mt-4 space-y-4">
          <div className="flex items-center gap-3">
            <div>
              <Label htmlFor="width-input">Width (px)</Label>
              <Input
                id="width-input"
                type="number"
                min={1}
                value={options.width || ""}
                onChange={(e) => setOptions({ ...options, width: parseInt(e.target.value, 10) || undefined })}
                className="mt-1.5 w-28"
              />
            </div>
            <div>
              <Label htmlFor="height-input">Height (px)</Label>
              <Input
                id="height-input"
                type="number"
                min={1}
                value={options.height || ""}
                onChange={(e) => setOptions({ ...options, height: parseInt(e.target.value, 10) || undefined })}
                className="mt-1.5 w-28"
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="lock-aspect" className="font-normal">
              Maintain aspect ratio
            </Label>
            <Switch
              id="lock-aspect"
              checked={options.maintainAspectRatio ?? true}
              onCheckedChange={(v) => setOptions({ ...options, maintainAspectRatio: v })}
            />
          </div>
        </TabsContent>

        <TabsContent value="percentage" className="mt-4">
          <Label>Scale: {options.percentage || 100}%</Label>
          <Slider
            className="mt-2"
            min={1}
            max={200}
            value={[options.percentage || 100]}
            onValueChange={([v]) => setOptions({ ...options, percentage: v })}
          />
        </TabsContent>
      </Tabs>
    </Card>
  );
}
