import { pdfToExcel } from "@/lib/engines/document/excel-pdf";

export const pdfToExcelAdapter = {
  accepts: ["application/pdf"],
  multiple: false,
  defaultOptions: {},
  runButtonLabel: "Convert to Excel",
  async run(files, options, onProgress) {
    const blob = await pdfToExcel(files[0], (p) => onProgress({ stage: "Extracting tables", value: p }));
    return [{ blob, name: files[0].name.replace(/\.pdf$/i, ".xlsx") }];
  },
};
