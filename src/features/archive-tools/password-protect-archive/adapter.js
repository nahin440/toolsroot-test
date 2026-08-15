import { createPasswordProtectedArchive } from "@/lib/engines/archive/archive-core";
import { PasswordProtectArchiveOptionsPanel } from "./options-panel";

export const passwordProtectArchiveAdapter = {
  accepts: ["*"],
  multiple: true,
  minFiles: 1,
  OptionsPanel: PasswordProtectArchiveOptionsPanel,
  defaultOptions: {},
  runButtonLabel: "Create protected archive",
  async run(files, options, onProgress) {
    if (!options.password || options.password.length === 0) {
      throw new Error("Choose a password first.");
    }
    onProgress({ stage: "Encrypting archive", value: 0 });
    const blob = await createPasswordProtectedArchive(files, options.password, (p) =>
      onProgress({ stage: "Encrypting archive", value: p })
    );
    return [{ blob, name: "protected.7z" }];
  },
};
