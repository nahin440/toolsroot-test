import { listArchiveContents } from "@/lib/engines/archive/archive-core";
import { formatBytes } from "@/lib/validation/validate-file";
import { ListArchiveContentsOptionsPanel } from "./options-panel";

function buildListingText(entries, archiveName) {
  const lines = [`Contents of ${archiveName}`, ""];
  entries.forEach((entry) => {
    const size = entry.isDirectory ? "" : `  ${formatBytes(entry.uncompressedSize || 0)}`;
    lines.push(`${entry.isDirectory ? "[dir] " : ""}${entry.name}${size}`);
  });
  return lines.join("\n");
}

export const listArchiveContentsAdapter = {
  accepts: [".zip", ".7z", ".tar", ".gz", ".rar"],
  multiple: false,
  OptionsPanel: ListArchiveContentsOptionsPanel,
  defaultOptions: {},
  runButtonLabel: "Download file list",
  async run(files, options, onProgress) {
    onProgress({ stage: "Reading archive", value: 0.5 });
    const entries = await listArchiveContents(files[0]);
    onProgress({ stage: "Reading archive", value: 1 });
    const text = buildListingText(entries, files[0].name);
    const blob = new Blob([text], { type: "text/plain" });
    return [{ blob, name: files[0].name.replace(/\.[^.]+$/, "") + "-contents.txt" }];
  },
};
