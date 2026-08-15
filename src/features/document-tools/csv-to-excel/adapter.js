import { csvToExcel } from "@/lib/engines/document/csv-to-excel";

export const csvToExcelAdapter = {
  accepts: [".csv"],
  multiple: false,
  defaultOptions: {},
  runButtonLabel: "Convert to Excel",
  async run(files, options, onProgress) {
    onProgress({ stage: "Converting", value: 0.3 });
    const blob = await csvToExcel(files[0]);
    onProgress({ stage: "Converting", value: 1 });
    return [{ blob, name: files[0].name.replace(/\.csv$/i, ".xlsx") }];
  },
};
