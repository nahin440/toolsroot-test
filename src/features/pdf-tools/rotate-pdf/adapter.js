import { rotatePdf } from "@/lib/engines/pdf/pdf-core";
import { parsePageRangeText } from "@/lib/validation/page-range";
import { RotatePdfOptionsPanel } from "./options-panel";

export const rotatePdfAdapter = {
  accepts: ["application/pdf"],
  multiple: false,
  OptionsPanel: RotatePdfOptionsPanel,
  defaultOptions: { angle: 90 },
  runButtonLabel: "Rotate PDF now",
  async run(files, options, onProgress) {
    onProgress({ stage: "Rotating pages", value: 0.2 });
    const pageNumbers = options.pageRangeText ? parsePageRangeText(options.pageRangeText) : null;
    const blob = await rotatePdf(files[0], options.angle || 90, pageNumbers);
    onProgress({ stage: "Rotating pages", value: 1 });
    return [{ blob, name: files[0].name.replace(/\.pdf$/i, "-rotated.pdf") }];
  },
};
