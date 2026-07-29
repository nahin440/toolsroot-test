import { extractPages } from "@/lib/engines/pdf/pdf-core";
import { ExtractPdfPagesOptionsPanel } from "./options-panel";

export const extractPdfPagesAdapter = {
  accepts: ["application/pdf"],
  multiple: false,
  OptionsPanel: ExtractPdfPagesOptionsPanel,
  defaultOptions: { pagesToExtract: [] },
  runButtonLabel: "Extract pages now",
  async run(files, options, onProgress) {
    if (!options.pagesToExtract?.length) {
      throw new Error("Select at least one page to extract.");
    }
    onProgress({ stage: "Extracting pages", value: 0.3 });
    const blob = await extractPages(files[0], options.pagesToExtract);
    onProgress({ stage: "Extracting pages", value: 1 });
    return [{ blob, name: files[0].name.replace(/\.pdf$/i, "-extracted.pdf") }];
  },
};
