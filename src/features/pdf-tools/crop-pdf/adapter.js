import { cropPdf } from "@/lib/engines/pdf/pdf-core";
import { CropPdfOptionsPanel } from "./options-panel";

export const cropPdfAdapter = {
  accepts: ["application/pdf"],
  multiple: false,
  OptionsPanel: CropPdfOptionsPanel,
  defaultOptions: { margins: { top: 0, bottom: 0, left: 0, right: 0 } },
  runButtonLabel: "Crop PDF now",
  async run(files, options, onProgress) {
    onProgress({ stage: "Cropping pages", value: 0.4 });
    const blob = await cropPdf(files[0], options);
    onProgress({ stage: "Cropping pages", value: 1 });
    return [{ blob, name: files[0].name.replace(/\.pdf$/i, "-cropped.pdf") }];
  },
};
