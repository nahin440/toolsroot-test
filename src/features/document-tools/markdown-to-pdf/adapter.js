import { markdownToPdf } from "@/lib/engines/document/html-to-pdf";

export const markdownToPdfAdapter = {
  accepts: [".md", ".markdown"],
  multiple: false,
  defaultOptions: {},
  runButtonLabel: "Convert to PDF",
  async run(files, options, onProgress) {
    const markdown = await files[0].text();
    onProgress({ stage: "Rendering PDF", value: 0.2 });
    const blob = await markdownToPdf(markdown, (p) => onProgress({ stage: "Rendering PDF", value: 0.2 + p * 0.8 }));
    return [{ blob, name: files[0].name.replace(/\.(md|markdown)$/i, ".pdf") }];
  },
};
