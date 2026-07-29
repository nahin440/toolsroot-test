import { numberPages } from "@/lib/engines/pdf/pdf-core";
import { NumberPdfPagesOptionsPanel } from "./options-panel";

export const numberPdfPagesAdapter = {
  accepts: ["application/pdf"],
  multiple: false,
  OptionsPanel: NumberPdfPagesOptionsPanel,
  defaultOptions: { position: "bottom-center", format: "n", startAt: 1 },
  runButtonLabel: "Add page numbers now",
  async run(files, options, onProgress) {
    onProgress({ stage: "Adding page numbers", value: 0.4 });
    const blob = await numberPages(files[0], options);
    onProgress({ stage: "Adding page numbers", value: 1 });
    return [{ blob, name: files[0].name.replace(/\.pdf$/i, "-numbered.pdf") }];
  },
};
