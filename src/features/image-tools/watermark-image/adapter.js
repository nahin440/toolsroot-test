import { watermarkImage } from "@/lib/engines/image/image-core";
import { WatermarkImageOptionsPanel } from "./options-panel";

export const watermarkImageAdapter = {
  accepts: ["image/*"],
  multiple: true,
  OptionsPanel: WatermarkImageOptionsPanel,
  defaultOptions: { type: "text", position: "center", opacity: 0.35 },
  runButtonLabel: "Add watermark now",
  zipName: "watermarked-images",
  async run(files, options, onProgress) {
    if (options.type === "text" && !options.text?.trim()) {
      throw new Error("Enter watermark text, or switch to an image watermark.");
    }
    if (options.type === "image" && !options.imageFile) {
      throw new Error("Upload an image to use as a watermark.");
    }
    const outputs = [];
    for (let i = 0; i < files.length; i++) {
      onProgress({ stage: `Watermarking ${files[i].name}`, value: i / files.length });
      const blob = await watermarkImage(files[i], options);
      outputs.push({ blob, name: files[i].name });
    }
    onProgress({ stage: "Done", value: 1 });
    return outputs;
  },
};
