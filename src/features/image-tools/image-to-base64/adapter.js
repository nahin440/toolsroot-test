import { imageToBase64 } from "@/lib/engines/image/image-core";
import { ImageToBase64OptionsPanel } from "./options-panel";

export const imageToBase64Adapter = {
  accepts: ["image/*"],
  multiple: false,
  OptionsPanel: ImageToBase64OptionsPanel,
  defaultOptions: { includeDataUriPrefix: true },
  runButtonLabel: "Download as .txt",
  async run(files, options, onProgress) {
    onProgress({ stage: "Encoding", value: 0.5 });
    const value = await imageToBase64(files[0], options);
    onProgress({ stage: "Encoding", value: 1 });
    const blob = new Blob([value], { type: "text/plain" });
    return [{ blob, name: files[0].name.replace(/\.[^.]+$/, "") + "-base64.txt" }];
  },
};
