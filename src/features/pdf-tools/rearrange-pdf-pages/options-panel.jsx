"use client";

import { useEffect, useRef, useState } from "react";
import { Reorder } from "motion/react";
import { HiOutlineTrash } from "react-icons/hi2";

import { openPdfDocument } from "@/lib/engines/pdf/pdfjs-loader";
import { Card } from "@/components/ui/card";

export function RearrangePdfPagesOptionsPanel({ files, options, setOptions }) {
  const [thumbnails, setThumbnails] = useState([]);
  const [order, setOrder] = useState(options.newOrder || []);
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;
    (async () => {
      const doc = await openPdfDocument(files[0]);
      const results = [];
      for (let i = 1; i <= doc.numPages; i++) {
        if (cancelledRef.current) return;
        const page = await doc.getPage(i);
        const viewport = page.getViewport({ scale: 0.3 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        await page.render({ canvasContext: ctx, viewport }).promise;
        results.push({ pageNum: i, dataUrl: canvas.toDataURL("image/png") });
        setThumbnails([...results]);
      }
      const initialOrder = results.map((r) => r.pageNum);
      setOrder(initialOrder);
      setOptions((prev) => ({ ...prev, newOrder: initialOrder }));
    })();
    return () => {
      cancelledRef.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  function handleReorder(newOrder) {
    setOrder(newOrder);
    setOptions({ ...options, newOrder });
  }

  function removePage(pageNum) {
    const next = order.filter((p) => p !== pageNum);
    setOrder(next);
    setOptions({ ...options, newOrder: next });
  }

  const thumbByPage = new Map(thumbnails.map((t) => [t.pageNum, t]));

  return (
    <Card className="p-5">
      <p className="mb-3 text-sm text-muted-foreground">
        Drag pages into the order you want. Click the trash icon to drop a page entirely.
      </p>
      <Reorder.Group
        axis="y"
        values={order}
        onReorder={handleReorder}
        className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5"
        as="div"
      >
        {order.map((pageNum) => {
          const thumb = thumbByPage.get(pageNum);
          if (!thumb) return null;
          return (
            <Reorder.Item
              key={pageNum}
              value={pageNum}
              className="group relative cursor-grab overflow-hidden rounded-lg border-2 border-border bg-card active:cursor-grabbing"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- dynamic data-URL thumbnail, not a static asset */}
              <img src={thumb.dataUrl} alt={`Page ${pageNum}`} className="w-full" />
              <button
                type="button"
                onClick={() => removePage(pageNum)}
                className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-primary/80 text-primary-foreground opacity-0 transition-opacity group-hover:opacity-100"
                aria-label={`Remove page ${pageNum}`}
              >
                <HiOutlineTrash className="size-3.5" />
              </button>
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-primary/80 px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                {pageNum}
              </span>
            </Reorder.Item>
          );
        })}
      </Reorder.Group>
    </Card>
  );
}
