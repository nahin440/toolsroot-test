import { addFilesToZip } from "@/lib/engines/archive/archive-core";
import { AddToArchiveOptionsPanel } from "./options-panel";

export const addToArchiveAdapter = {
  accepts: [".zip"],
  multiple: false,
  OptionsPanel: AddToArchiveOptionsPanel,
  defaultOptions: { newFiles: [] },
  runButtonLabel: "Add files now",
  async run(files, options, onProgress) {
    if (!options.newFiles || options.newFiles.length === 0) {
      throw new Error("Add at least one file before continuing.");
    }
    onProgress({ stage: "Adding files to archive", value: 0 });
    const blob = await addFilesToZip(files[0], options.newFiles, (p) =>
      onProgress({ stage: "Adding files to archive", value: p })
    );
    return [{ blob, name: files[0].name.replace(/\.zip$/i, "-updated.zip") }];
  },
};
