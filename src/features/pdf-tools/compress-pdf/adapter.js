import { compressPdf } from "@/lib/engines/pdf/compress-pdf";
import { CompressPdfOptionsPanel } from "./options-panel";

export const compressPdfAdapter = {
  accepts: ["application/pdf"],
  multiple: false,
  OptionsPanel: CompressPdfOptionsPanel,
  defaultOptions: { level: "medium" },
  runButtonLabel: "Compress PDF now",
  async run(files, options, onProgress) {
    onProgress({ stage: "Compressing embedded images", value: 0 });
    const blob = await compressPdf(files[0], options.level, (p) =>
      onProgress({ stage: "Compressing embedded images", value: p })
    );
    return [{ blob, name: files[0].name.replace(/\.pdf$/i, "-compressed.pdf") }];
  },
};
