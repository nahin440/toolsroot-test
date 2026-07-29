import { htmlToPdf } from "@/lib/engines/document/html-to-pdf";

export const htmlToPdfAdapter = {
  accepts: [".html", ".htm"],
  multiple: false,
  defaultOptions: {},
  runButtonLabel: "Convert to PDF",
  async run(files, options, onProgress) {
    const html = await files[0].text();
    onProgress({ stage: "Rendering PDF", value: 0.2 });
    const blob = await htmlToPdf(html, (p) => onProgress({ stage: "Rendering PDF", value: 0.2 + p * 0.8 }));
    return [{ blob, name: files[0].name.replace(/\.html?$/i, ".pdf") }];
  },
};
