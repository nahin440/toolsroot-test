import { passwordProtectPdf } from "@/lib/engines/pdf/password-protection";
import { PasswordProtectPdfOptionsPanel } from "./options-panel";

export const passwordProtectPdfAdapter = {
  accepts: ["application/pdf"],
  multiple: false,
  OptionsPanel: PasswordProtectPdfOptionsPanel,
  defaultOptions: { permissions: { allowPrinting: true, allowCopying: false, allowModifying: false } },
  runButtonLabel: "Protect PDF now",
  async run(files, options, onProgress) {
    if (!options.userPassword?.trim()) {
      throw new Error("Enter a password to protect this PDF.");
    }
    onProgress({ stage: "Encrypting PDF", value: 0.4 });
    const blob = await passwordProtectPdf(files[0], options);
    onProgress({ stage: "Encrypting PDF", value: 1 });
    return [{ blob, name: files[0].name.replace(/\.pdf$/i, "-protected.pdf") }];
  },
};
