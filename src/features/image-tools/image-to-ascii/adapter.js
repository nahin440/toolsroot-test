import { imageToAscii } from "@/lib/engines/image/image-core";
import { ImageToAsciiOptionsPanel } from "./options-panel";

export const imageToAsciiAdapter = {
  accepts: ["image/*"],
  multiple: false,
  OptionsPanel: ImageToAsciiOptionsPanel,
  defaultOptions: { columns: 100, colorMode: true },
  runButtonLabel: "Download ASCII art",
  async run(files, options, onProgress) {
    onProgress({ stage: "Rendering ASCII art", value: 0.5 });
    const { text } = await imageToAscii(files[0], { columns: options.columns || 100 });
    onProgress({ stage: "Rendering ASCII art", value: 1 });
    const blob = new Blob([text], { type: "text/plain" });
    return [{ blob, name: files[0].name.replace(/\.[^.]+$/, "") + "-ascii.txt" }];
  },
};
