import { makeSearchablePdf } from "@/lib/engines/ocr/searchable-pdf";
import { OcrPdfOptionsPanel } from "./options-panel";

export const ocrPdfAdapter = {
  accepts: ["application/pdf"],
  multiple: false,
  OptionsPanel: OcrPdfOptionsPanel,
  defaultOptions: { lang: "eng" },
  runButtonLabel: "Run OCR now",
  async run(files, options, onProgress) {
    onProgress({ stage: "Recognizing text", value: 0 });
    const blob = await makeSearchablePdf(files[0], (p) => onProgress({ stage: "Recognizing text", value: p }), options.lang);
    return [{ blob, name: files[0].name.replace(/\.pdf$/i, "-searchable.pdf") }];
  },
};
