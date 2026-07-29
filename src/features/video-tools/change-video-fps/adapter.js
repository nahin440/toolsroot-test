import { changeVideoFps } from "@/lib/engines/media/media-core";
import { ChangeVideoFpsOptionsPanel } from "./options-panel";

export const changeVideoFpsAdapter = {
  accepts: ["video/*"],
  multiple: false,
  OptionsPanel: ChangeVideoFpsOptionsPanel,
  defaultOptions: { targetFps: 30 },
  runButtonLabel: "Apply now",
  async run(files, options, onProgress) {
    const blob = await changeVideoFps(files[0], options.targetFps || 30, (p) =>
      onProgress({ stage: "Changing frame rate", value: p })
    );
    return [{ blob, name: files[0].name.replace(/\.([^.]+)$/, "-fps.$1") }];
  },
};
