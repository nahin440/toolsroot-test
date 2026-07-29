"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dropzone } from "@/components/upload/dropzone";

export function WatermarkPdfOptionsPanel({ options, setOptions }) {
  const type = options.type || "text";

  return (
    <Card className="space-y-5 p-5">
      <Tabs value={type} onValueChange={(v) => setOptions({ ...options, type: v })}>
        <TabsList>
          <TabsTrigger value="text">Text watermark</TabsTrigger>
          <TabsTrigger value="image">Image watermark</TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="mt-4">
          <Label htmlFor="wm-text">Watermark text</Label>
          <Input
            id="wm-text"
            placeholder="e.g. CONFIDENTIAL"
            value={options.text || ""}
            onChange={(e) => setOptions({ ...options, text: e.target.value })}
            className="mt-1.5"
          />
        </TabsContent>

        <TabsContent value="image" className="mt-4">
          <Dropzone
            accepts={["image/*"]}
            multiple={false}
            compact
            label="Upload a watermark image"
            onFilesAccepted={(files) => setOptions({ ...options, imageFile: files[0] })}
          />
          {options.imageFile && (
            <p className="mt-2 text-xs text-muted-foreground">Selected: {options.imageFile.name}</p>
          )}
        </TabsContent>
      </Tabs>

      <div>
        <Label>Position</Label>
        <Select value={options.position || "center"} onValueChange={(v) => setOptions({ ...options, position: v })}>
          <SelectTrigger className="mt-1.5 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="center">Center (once per page)</SelectItem>
            <SelectItem value="tiled">Tiled (repeated across page)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Opacity: {Math.round((options.opacity ?? 0.3) * 100)}%</Label>
        <Slider
          className="mt-2"
          min={5}
          max={100}
          value={[Math.round((options.opacity ?? 0.3) * 100)]}
          onValueChange={([v]) => setOptions({ ...options, opacity: v / 100 })}
        />
      </div>

      <div>
        <Label>Rotation: {options.rotationDeg ?? -45}°</Label>
        <Slider
          className="mt-2"
          min={-90}
          max={90}
          value={[options.rotationDeg ?? -45]}
          onValueChange={([v]) => setOptions({ ...options, rotationDeg: v })}
        />
      </div>
    </Card>
  );
}
