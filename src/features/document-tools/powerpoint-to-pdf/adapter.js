import { powerpointToPdf } from "@/lib/engines/document/document-orchestrators";

export const powerpointToPdfAdapter = {
  accepts: [".pptx"],
  multiple: false,
  defaultOptions: {},
  runButtonLabel: "Convert to PDF",
  async run(files, options, onProgress) {
    const blob = await powerpointToPdf(files[0], (p) => onProgress({ stage: "Rendering slides", value: p }));
    return [{ blob, name: files[0].name.replace(/\.pptx$/i, ".pdf") }];
  },
};
