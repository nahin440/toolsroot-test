import { pdfToCsv } from "@/lib/engines/pdf/pdf-to-csv";

export const pdfToCsvAdapter = {
  accepts: ["application/pdf"],
  multiple: false,
  defaultOptions: {},
  runButtonLabel: "Convert to CSV",
  zipName: "pdf-to-csv",
  async run(files, options, onProgress) {
    onProgress({ stage: "Extracting tables", value: 0 });
    const outputs = await pdfToCsv(files[0], (p) => onProgress({ stage: "Extracting tables", value: p }));
    return outputs;
  },
};
