import { convertToPdfA } from "@/lib/engines/pdf/pdf-core";
import { PdfToPdfaOptionsPanel } from "./options-panel";

export const pdfToPdfaAdapter = {
  accepts: ["application/pdf"],
  multiple: false,
  OptionsPanel: PdfToPdfaOptionsPanel,
  defaultOptions: {},
  runButtonLabel: "Convert to PDF/A",
  async run(files, options, onProgress) {
    onProgress({ stage: "Embedding color profile", value: 0.3 });
    const blob = await convertToPdfA(files[0]);
    onProgress({ stage: "Embedding color profile", value: 1 });
    return [{ blob, name: files[0].name.replace(/\.pdf$/i, "-pdfa.pdf") }];
  },
};
