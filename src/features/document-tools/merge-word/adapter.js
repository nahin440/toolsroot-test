import { mergeWordDocuments } from "@/lib/engines/document/merge-word";

export const mergeWordAdapter = {
  accepts: [".docx"],
  multiple: true,
  minFiles: 2,
  defaultOptions: {},
  runButtonLabel: "Merge documents now",
  async run(files, options, onProgress) {
    onProgress({ stage: "Merging documents", value: 0 });
    const blob = await mergeWordDocuments(files, (p) =>
      onProgress({ stage: "Merging documents", value: p })
    );
    return [{ blob, name: "merged.docx" }];
  },
};
