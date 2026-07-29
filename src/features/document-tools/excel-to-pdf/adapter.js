import { excelToPdf } from "@/lib/engines/document/excel-pdf";

export const excelToPdfAdapter = {
  accepts: [".xlsx", ".xls", ".csv"],
  multiple: false,
  defaultOptions: {},
  runButtonLabel: "Convert to PDF",
  async run(files, options, onProgress) {
    const blob = await excelToPdf(files[0], (p) => onProgress({ stage: "Rendering spreadsheet", value: p }));
    return [{ blob, name: files[0].name.replace(/\.(xlsx|xls|csv)$/i, ".pdf") }];
  },
};
