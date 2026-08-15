import { convertArchiveFormat } from "@/lib/engines/archive/archive-core";
import { ConvertArchiveOptionsPanel } from "./options-panel";

const EXT_MAP = { zip: "zip", "7z": "7z", tar: "tar", gztar: "tar.gz" };

export const convertArchiveAdapter = {
  accepts: [".zip", ".7z", ".tar", ".gz", ".rar"],
  multiple: false,
  OptionsPanel: ConvertArchiveOptionsPanel,
  defaultOptions: {},
  runButtonLabel: "Convert now",
  async run(files, options, onProgress) {
    const target = options.targetFormat || "zip";
    onProgress({ stage: "Converting archive", value: 0 });
    const blob = await convertArchiveFormat(files[0], target, (p) =>
      onProgress({ stage: "Converting archive", value: p })
    );
    return [{ blob, name: files[0].name.replace(/\.[^.]+$/, "") + "." + EXT_MAP[target] }];
  },
};
