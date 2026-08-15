import { pdfToImages } from "@/lib/engines/pdf/pdf-core";
import { PdfToJpgOptionsPanel } from "./options-panel";

export const pdfToJpgAdapter = {
  accepts: ["application/pdf"],
  multiple: false,
  OptionsPanel: PdfToJpgOptionsPanel,
  defaultOptions: { scale: 2, quality: 0.92 },
  runButtonLabel: "Convert to JPG",
  zipName: "pdf-to-jpg",
  async run(files, options, onProgress) {
    onProgress({ stage: "Rendering pages", value: 0 });
    const outputs = await pdfToImages(
      files[0],
      "jpg",
      { scale: options.scale || 2, quality: options.quality ?? 0.92 },
      (p) => onProgress({ stage: "Rendering pages", value: p })
    );
    return outputs;
  },
};
