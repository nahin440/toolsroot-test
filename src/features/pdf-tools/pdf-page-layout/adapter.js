import { layoutPagesPerSheet } from "@/lib/engines/pdf/pdf-core";
import { PdfPageLayoutOptionsPanel } from "./options-panel";

export const pdfPageLayoutAdapter = {
  accepts: ["application/pdf"],
  multiple: false,
  OptionsPanel: PdfPageLayoutOptionsPanel,
  defaultOptions: { perSheet: 4 },
  runButtonLabel: "Lay out PDF now",
  async run(files, options, onProgress) {
    onProgress({ stage: "Arranging pages", value: 0.2 });
    const blob = await layoutPagesPerSheet(files[0], options.perSheet || 4);
    onProgress({ stage: "Arranging pages", value: 1 });
    return [{ blob, name: files[0].name.replace(/\.pdf$/i, `-${options.perSheet || 4}up.pdf`) }];
  },
};
