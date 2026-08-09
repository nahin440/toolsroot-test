import { watermarkVideo } from "@/lib/engines/media/media-core";
import { WatermarkVideoOptionsPanel } from "./options-panel";

export const watermarkVideoAdapter = {
  accepts: ["video/*"],
  multiple: false,
  // 1GB — ffmpeg.wasm runs entirely in-browser (no server), so this is
  // sized well above the app-wide 200MB default specifically for video,
  // which is the one file category large enough to need it; still well
  // under what a typical modern browser tab can hold in memory for a
  // single WASM operation.
  maxSizeBytes: 1024 * 1024 * 1024,
  OptionsPanel: WatermarkVideoOptionsPanel,
  defaultOptions: { type: "text", position: "bottom-right", opacity: 0.7 },
  runButtonLabel: "Add watermark now",
  async run(files, options, onProgress) {
    if (options.type === "text" && !options.text?.trim()) {
      throw new Error("Enter watermark text, or switch to an image watermark.");
    }
    if (options.type === "image" && !options.imageFile) {
      throw new Error("Upload an image to use as a watermark.");
    }
    const blob = await watermarkVideo(files[0], options, (p) =>
      onProgress({ stage: "Applying watermark", value: p })
    );
    return [{ blob, name: files[0].name.replace(/\.([^.]+)$/, "-watermarked.$1") }];
  },
};
