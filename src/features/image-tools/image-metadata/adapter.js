import { stripImageMetadata } from "@/lib/engines/image/image-core";
import { ImageMetadataOptionsPanel } from "./options-panel";

export const imageMetadataAdapter = {
  accepts: ["image/*"],
  multiple: false,
  OptionsPanel: ImageMetadataOptionsPanel,
  defaultOptions: { strip: false },
  runButtonLabel: "Continue",
  async run(files, options, onProgress) {
    if (!options.strip) {
      // Nothing to download if the person just wanted to view metadata —
      // return the original file unchanged so the flow still completes.
      onProgress({ stage: "Done", value: 1 });
      return [{ blob: files[0], name: files[0].name }];
    }
    onProgress({ stage: "Removing metadata", value: 0.4 });
    const blob = await stripImageMetadata(files[0]);
    onProgress({ stage: "Removing metadata", value: 1 });
    return [{ blob, name: files[0].name.replace(/\.[^.]+$/, "") + "-clean." + files[0].name.split(".").pop() }];
  },
};
