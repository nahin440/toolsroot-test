import { createZip, createArchive } from "@/lib/engines/archive/archive-core";
import { CreateArchiveOptionsPanel } from "./options-panel";

const EXT_MAP = { zip: "zip", "7z": "7z", tar: "tar", gztar: "tar.gz" };

export const createArchiveAdapter = {
  accepts: ["*"],
  multiple: true,
  minFiles: 1,
  OptionsPanel: CreateArchiveOptionsPanel,
  defaultOptions: { format: "zip" },
  runButtonLabel: "Create archive now",
  async run(files, options, onProgress) {
    const format = options.format || "zip";
    onProgress({ stage: "Compressing files", value: 0.2 });

    const blob =
      format === "zip"
        ? await createZip(files, (p) => onProgress({ stage: "Compressing files", value: 0.2 + p * 0.8 }))
        : await createArchive(files, format, (p) => onProgress({ stage: "Compressing files", value: 0.2 + p * 0.8 }));

    return [{ blob, name: `archive.${EXT_MAP[format]}` }];
  },
};
