import { watermarkVideo } from "@/lib/engines/media/media-core";
import { WatermarkVideoOptionsPanel } from "./options-panel";

export const watermarkVideoAdapter = {
  accepts: ["video/*"],
  multiple: false,
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
