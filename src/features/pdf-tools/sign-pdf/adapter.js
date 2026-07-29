import { signPdf } from "@/lib/engines/pdf/sign-pdf";
import { SignPdfOptionsPanel } from "./options-panel";

export const signPdfAdapter = {
  accepts: ["application/pdf"],
  multiple: false,
  OptionsPanel: SignPdfOptionsPanel,
  defaultOptions: { mode: "draw", pageNum: 1 },
  runButtonLabel: "Sign PDF now",
  async run(files, options, onProgress) {
    onProgress({ stage: "Placing signature", value: 0.4 });
    const blob = await signPdf(files[0], options);
    onProgress({ stage: "Placing signature", value: 1 });
    return [{ blob, name: files[0].name.replace(/\.pdf$/i, "-signed.pdf") }];
  },
};
