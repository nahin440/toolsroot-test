import { textToPdf } from "@/lib/engines/document/html-to-pdf";

export const txtToPdfAdapter = {
  accepts: [".txt"],
  multiple: false,
  defaultOptions: {},
  runButtonLabel: "Convert to PDF",
  async run(files, options, onProgress) {
    const text = await files[0].text();
    onProgress({ stage: "Rendering PDF", value: 0.2 });
    const blob = await textToPdf(text, (p) => onProgress({ stage: "Rendering PDF", value: 0.2 + p * 0.8 }));
    return [{ blob, name: files[0].name.replace(/\.txt$/i, ".pdf") }];
  },
};
