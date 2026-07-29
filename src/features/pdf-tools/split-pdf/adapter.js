import { splitPdf } from "@/lib/engines/pdf/pdf-core";
import { SplitPdfOptionsPanel } from "./options-panel";

export const splitPdfAdapter = {
  accepts: ["application/pdf"],
  multiple: false,
  OptionsPanel: SplitPdfOptionsPanel,
  defaultOptions: { mode: "every-page" },
  runButtonLabel: "Split PDF now",
  zipName: "split-pages",
  async run(files, options, onProgress) {
    onProgress({ stage: "Splitting PDF", value: 0 });
    const outputs = await splitPdf(files[0], options.mode, options, (p) =>
      onProgress({ stage: "Splitting PDF", value: p })
    );
    return outputs.map((o) => ({ blob: o.blob, name: o.name }));
  },
};
