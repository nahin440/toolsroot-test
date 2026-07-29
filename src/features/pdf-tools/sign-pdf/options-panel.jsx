"use client";

import { useEffect, useRef, useState } from "react";
import SignaturePad from "signature_pad";
import { HiOutlineTrash } from "react-icons/hi2";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dropzone } from "@/components/upload/dropzone";
import { openPdfDocument } from "@/lib/engines/pdf/pdfjs-loader";

function DrawSignaturePad({ onChange }) {
  const canvasRef = useRef(null);
  const padRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    canvas.getContext("2d").scale(2, 2);
    padRef.current = new SignaturePad(canvas, { backgroundColor: "rgba(255,255,255,0)", penColor: "#0a0a0a" });
    padRef.current.addEventListener("endStroke", () => {
      onChange(padRef.current.isEmpty() ? null : padRef.current.toDataURL("image/png"));
    });
    return () => padRef.current?.off();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <canvas
        ref={canvasRef}
        className="h-40 w-full rounded-xl border border-border bg-secondary/30"
        style={{ touchAction: "none" }}
      />
      <Button
        variant="ghost"
        size="sm"
        className="mt-2"
        onClick={() => {
          padRef.current?.clear();
          onChange(null);
        }}
      >
        <HiOutlineTrash className="size-4" />
        Clear
      </Button>
    </div>
  );
}

function TypedSignature({ value, onChange }) {
  return (
    <div>
      <Input
        placeholder="Type your name"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="text-2xl italic"
        style={{ fontFamily: "cursive" }}
      />
    </div>
  );
}

export function SignPdfOptionsPanel({ files, options, setOptions }) {
  const [mode, setMode] = useState(options.mode || "draw");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [pageSize, setPageSize] = useState({ width: 612, height: 792 });

  useEffect(() => {
    openPdfDocument(files[0]).then(async (doc) => {
      const page = await doc.getPage(1);
      const viewport = page.getViewport({ scale: 0.6 });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
      setPreviewUrl(canvas.toDataURL("image/png"));
      const fullViewport = page.getViewport({ scale: 1 });
      setPageSize({ width: fullViewport.width, height: fullViewport.height });
    });
  }, [files]);

  function handlePreviewClick(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    const relY = (e.clientY - rect.top) / rect.height;
    setOptions({
      ...options,
      xPt: relX * pageSize.width,
      yPt: pageSize.height - relY * pageSize.height,
    });
  }

  return (
    <Card className="space-y-4 p-5">
      <Tabs
        value={mode}
        onValueChange={(v) => {
          setMode(v);
          setOptions({ ...options, mode: v });
        }}
      >
        <TabsList>
          <TabsTrigger value="draw">Draw</TabsTrigger>
          <TabsTrigger value="type">Type</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
        </TabsList>
        <TabsContent value="draw" className="mt-4">
          <DrawSignaturePad onChange={(dataUrl) => setOptions({ ...options, signatureDataUrl: dataUrl })} />
        </TabsContent>
        <TabsContent value="type" className="mt-4">
          <TypedSignature
            value={options.typedText}
            onChange={(text) => setOptions({ ...options, typedText: text })}
          />
        </TabsContent>
        <TabsContent value="upload" className="mt-4">
          <Dropzone
            accepts={["image/*"]}
            multiple={false}
            compact
            label="Upload a signature image"
            onFilesAccepted={(files) => setOptions({ ...options, signatureFile: files[0] })}
          />
        </TabsContent>
      </Tabs>

      <div>
        <p className="mb-2 text-sm font-medium text-foreground">Click on the page to place your signature</p>
        {previewUrl && (
          <div className="relative inline-block cursor-crosshair" onClick={handlePreviewClick}>
            {/* eslint-disable-next-line @next/next/no-img-element -- dynamic canvas-rendered page preview, not a static asset */}
            <img src={previewUrl} alt="Page 1 preview" className="rounded-lg border border-border" />
            {options.xPt !== undefined && (
              <div
                className="absolute flex h-8 w-24 items-center justify-center rounded border-2 border-accent bg-accent-tint/70 text-[10px] text-accent-active"
                style={{
                  left: `${(options.xPt / pageSize.width) * 100}%`,
                  top: `${(1 - options.yPt / pageSize.height) * 100}%`,
                  transform: "translate(-10%, -50%)",
                }}
              >
                Signature
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
