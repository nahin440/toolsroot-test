import { imagesToPdf } from "@/lib/engines/image/image-to-pdf";
import { ImageToPdfOptionsPanel } from "@/features/image-tools/convert-image-to-pdf/options-panel";

export const jpgToPdfAdapter = {
  accepts: ["image/*"],
  multiple: true,
  minFiles: 1,
  OptionsPanel: ImageToPdfOptionsPanel,
  defaultOptions: { pageSize: "a4", orientation: "portrait" },
  runButtonLabel: "Create PDF now",
  async run(files, options, onProgress) {
    onProgress({ stage: "Building PDF", value: 0.3 });
    const blob = await imagesToPdf(files, options);
    onProgress({ stage: "Building PDF", value: 1 });
    return [{ blob, name: files.length === 1 ? files[0].name.replace(/\.[^.]+$/, ".pdf") : "images.pdf" }];
  },
};
