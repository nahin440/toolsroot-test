"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dropzone } from "@/components/upload/dropzone";

export function WatermarkVideoOptionsPanel({ options, setOptions }) {
  const type = options.type || "text";

  return (
    <Card className="space-y-5 p-5">
      <Tabs value={type} onValueChange={(v) => setOptions({ ...options, type: v })}>
        <TabsList>
          <TabsTrigger value="text">Text</TabsTrigger>
          <TabsTrigger value="image">Image</TabsTrigger>
        </TabsList>
        <TabsContent value="text" className="mt-4">
          <Label htmlFor="wm-text">Watermark text</Label>
          <Input
            id="wm-text"
            placeholder="© Your Name"
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
            label="Upload a watermark/logo image"
            onFilesAccepted={(files) => setOptions({ ...options, imageFile: files[0] })}
          />
        </TabsContent>
      </Tabs>

      <div>
        <Label>Position</Label>
        <Select
          value={options.position || "bottom-right"}
          onValueChange={(v) => setOptions({ ...options, position: v })}
        >
          <SelectTrigger className="mt-1.5 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="top-left">Top left</SelectItem>
            <SelectItem value="top-right">Top right</SelectItem>
            <SelectItem value="bottom-left">Bottom left</SelectItem>
            <SelectItem value="bottom-right">Bottom right</SelectItem>
            <SelectItem value="center">Center</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {type === "text" && (
        <div>
          <Label>Opacity: {Math.round((options.opacity ?? 0.7) * 100)}%</Label>
          <Slider
            className="mt-2"
            min={10}
            max={100}
            value={[Math.round((options.opacity ?? 0.7) * 100)]}
            onValueChange={([v]) => setOptions({ ...options, opacity: v / 100 })}
          />
        </div>
      )}
    </Card>
  );
}
