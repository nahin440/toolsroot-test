import { pdfToImages } from "@/lib/engines/pdf/pdf-core";
import { PdfToPngOptionsPanel } from "./options-panel";

export const pdfToPngAdapter = {
  accepts: ["application/pdf"],
  multiple: false,
  OptionsPanel: PdfToPngOptionsPanel,
  defaultOptions: { scale: 2 },
  runButtonLabel: "Convert to PNG",
  zipName: "pdf-to-png",
  async run(files, options, onProgress) {
    onProgress({ stage: "Rendering pages", value: 0 });
    const outputs = await pdfToImages(files[0], "png", { scale: options.scale || 2 }, (p) =>
      onProgress({ stage: "Rendering pages", value: p })
    );
    return outputs;
  },
};
