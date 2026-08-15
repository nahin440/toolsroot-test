import { extractColorPalette } from "@/lib/engines/image/image-core";
import { ImageColorPaletteOptionsPanel } from "./options-panel";

function buildPaletteText(palette, fileName) {
  const lines = [`Color palette extracted from ${fileName}`, ""];
  palette.forEach((c, i) => {
    const [r, g, b] = c.rgb;
    const pct = Math.round(c.population * 100);
    lines.push(`${i + 1}. ${c.hex}   rgb(${r}, ${g}, ${b})   ~${pct}% of image`);
  });
  return lines.join("\n");
}

export const imageColorPaletteAdapter = {
  accepts: ["image/*"],
  multiple: false,
  OptionsPanel: ImageColorPaletteOptionsPanel,
  defaultOptions: { count: 6 },
  runButtonLabel: "Download palette",
  async run(files, options, onProgress) {
    onProgress({ stage: "Extracting colors", value: 0.5 });
    const palette = await extractColorPalette(files[0], options.count || 6);
    onProgress({ stage: "Extracting colors", value: 1 });
    const text = buildPaletteText(palette, files[0].name);
    const blob = new Blob([text], { type: "text/plain" });
    return [{ blob, name: files[0].name.replace(/\.[^.]+$/, "") + "-palette.txt" }];
  },
};
