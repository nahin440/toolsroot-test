import { extractZip, extractArchive } from "@/lib/engines/archive/archive-core";

export const extractArchiveAdapter = {
  accepts: [".zip", ".rar", ".7z", ".tar", ".gz"],
  multiple: false,
  defaultOptions: {},
  runButtonLabel: "Extract now",
  zipName: "extracted-files",
  async run(files, options, onProgress) {
    const ext = (files[0].name.split(".").pop() || "").toLowerCase();
    onProgress({ stage: "Extracting archive", value: 0.2 });

    const outputs =
      ext === "zip"
        ? await extractZip(files[0], (p) => onProgress({ stage: "Extracting archive", value: 0.2 + p * 0.8 }))
        : await extractArchive(files[0], (p) => onProgress({ stage: "Extracting archive", value: 0.2 + p * 0.8 }));

    return outputs;
  },
};
