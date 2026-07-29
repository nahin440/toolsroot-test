import { repairPdf } from "@/lib/engines/pdf/pdf-core";

export const repairPdfAdapter = {
  accepts: ["application/pdf"],
  multiple: false,
  defaultOptions: {},
  runButtonLabel: "Repair PDF now",
  async run(files, options, onProgress) {
    onProgress({ stage: "Attempting structural repair", value: 0.4 });
    const blob = await repairPdf(files[0]);
    onProgress({ stage: "Attempting structural repair", value: 1 });
    return [{ blob, name: files[0].name.replace(/\.pdf$/i, "-repaired.pdf") }];
  },
};
