import { pdfToMarkdown } from "@/lib/engines/pdf/pdf-to-markdown";
import { PdfToMarkdownOptionsPanel } from "./options-panel";

export const pdfToMarkdownAdapter = {
  accepts: ["application/pdf"],
  multiple: false,
  OptionsPanel: PdfToMarkdownOptionsPanel,
  defaultOptions: {},
  runButtonLabel: "Download Markdown",
  async run(files, options, onProgress) {
    onProgress({ stage: "Converting", value: 0.5 });
    const markdown = await pdfToMarkdown(files[0]);
    onProgress({ stage: "Converting", value: 1 });
    const blob = new Blob([markdown], { type: "text/markdown" });
    return [{ blob, name: files[0].name.replace(/\.pdf$/i, ".md") }];
  },
};
