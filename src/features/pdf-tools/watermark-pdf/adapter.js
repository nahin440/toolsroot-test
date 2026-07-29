import { watermarkPdf } from "@/lib/engines/pdf/pdf-core";
import { WatermarkPdfOptionsPanel } from "./options-panel";

export const watermarkPdfAdapter = {
  accepts: ["application/pdf"],
  multiple: false,
  OptionsPanel: WatermarkPdfOptionsPanel,
  defaultOptions: { type: "text", position: "center", opacity: 0.3, rotationDeg: -45 },
  runButtonLabel: "Add watermark now",
  async run(files, options, onProgress) {
    if (options.type === "text" && !options.text?.trim()) {
      throw new Error("Enter watermark text, or switch to an image watermark.");
    }
    if (options.type === "image" && !options.imageFile) {
      throw new Error("Upload an image to use as a watermark.");
    }

    let imageBytes;
    let imageExt;
    if (options.type === "image") {
      imageBytes = new Uint8Array(await options.imageFile.arrayBuffer());
      imageExt = options.imageFile.name.split(".").pop();
    }

    onProgress({ stage: "Applying watermark", value: 0.3 });
    const blob = await watermarkPdf(files[0], { ...options, imageBytes, imageExt });
    onProgress({ stage: "Applying watermark", value: 1 });
    return [{ blob, name: files[0].name.replace(/\.pdf$/i, "-watermarked.pdf") }];
  },
};
