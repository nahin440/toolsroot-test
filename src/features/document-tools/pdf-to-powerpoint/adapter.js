import { pdfToPowerpoint } from "@/lib/engines/document/document-orchestrators";

export const pdfToPowerpointAdapter = {
  accepts: ["application/pdf"],
  multiple: false,
  defaultOptions: {},
  runButtonLabel: "Convert to PowerPoint",
  async run(files, options, onProgress) {
    const blob = await pdfToPowerpoint(files[0], (p) => onProgress({ stage: "Building slides", value: p }));
    return [{ blob, name: files[0].name.replace(/\.pdf$/i, ".pptx") }];
  },
};
