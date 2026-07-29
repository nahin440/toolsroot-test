import { wordToPdf } from "@/lib/engines/document/document-orchestrators";

export const wordToPdfAdapter = {
  accepts: [".docx"],
  multiple: false,
  defaultOptions: {},
  runButtonLabel: "Convert to PDF",
  async run(files, options, onProgress) {
    const blob = await wordToPdf(files[0], (p) => onProgress({ stage: "Converting document", value: p }));
    return [{ blob, name: files[0].name.replace(/\.docx$/i, ".pdf") }];
  },
};
