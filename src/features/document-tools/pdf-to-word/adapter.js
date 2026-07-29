import { convertPdfToOffice } from "@/lib/engines/pdf/convert-to-office";

export const pdfToWordAdapter = {
  accepts: ["application/pdf"],
  multiple: false,
  defaultOptions: {},
  runButtonLabel: "Convert to Word",
  async run(files, options, onProgress) {
    const { blob } = await convertPdfToOffice(files[0], "docx", ({ stage, value }) =>
      onProgress({ stage, value })
    );
    return [{ blob, name: files[0].name.replace(/\.pdf$/i, ".docx") }];
  },
};
