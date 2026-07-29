import { unlockPdf } from "@/lib/engines/pdf/password-protection";
import { UnlockPdfOptionsPanel } from "./options-panel";

export const unlockPdfAdapter = {
  accepts: ["application/pdf"],
  multiple: false,
  OptionsPanel: UnlockPdfOptionsPanel,
  defaultOptions: {},
  runButtonLabel: "Unlock PDF now",
  async run(files, options, onProgress) {
    if (!options.password) {
      throw new Error("Enter the PDF's current password.");
    }
    onProgress({ stage: "Removing password protection", value: 0.4 });
    const blob = await unlockPdf(files[0], options.password);
    onProgress({ stage: "Removing password protection", value: 1 });
    return [{ blob, name: files[0].name.replace(/\.pdf$/i, "-unlocked.pdf") }];
  },
};
