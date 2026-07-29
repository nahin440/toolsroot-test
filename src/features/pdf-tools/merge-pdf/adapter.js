import { mergePdfs } from "@/lib/engines/pdf/pdf-core";
import { MergePdfOptionsPanel } from "./options-panel";

export const mergePdfAdapter = {
  accepts: ["application/pdf"],
  multiple: true,
  minFiles: 2,
  OptionsPanel: MergePdfOptionsPanel,
  defaultOptions: {},
  runButtonLabel: "Merge PDFs now",
  async run(files, options, onProgress) {
    const orderedFiles = options.order ? options.order.map((i) => files[i]) : files;
    onProgress({ stage: "Merging PDF files", value: 0 });
    const blob = await mergePdfs(orderedFiles, (p) => onProgress({ stage: "Merging PDF files", value: p }));
    return [{ blob, name: "merged.pdf" }];
  },
};
