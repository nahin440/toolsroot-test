import { wordToExcel } from "@/lib/engines/document/word-to-excel";

export const wordToExcelAdapter = {
  accepts: [".docx"],
  multiple: false,
  defaultOptions: {},
  runButtonLabel: "Convert to Excel",
  async run(files, options, onProgress) {
    onProgress({ stage: "Extracting tables", value: 0.3 });
    const blob = await wordToExcel(files[0]);
    onProgress({ stage: "Extracting tables", value: 1 });
    return [{ blob, name: files[0].name.replace(/\.docx?$/i, ".xlsx") }];
  },
};
