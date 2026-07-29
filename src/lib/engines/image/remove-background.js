"use client";

/**
 * Real ML-based background removal via @imgly/background-removal, which
 * runs a genuine ONNX segmentation model (IS-Net) entirely in the
 * browser via WASM/WebGPU. This is the one tool in the app where model
 * weights (tens of MB) are fetched from IMG.LY's CDN on first use rather
 * than self-hosted — bundling every model variant into the app's own
 * deploy would bloat it for every visitor regardless of whether they use
 * this specific tool. The image itself never leaves the browser; only
 * the (file-independent) model weights are fetched externally, once,
 * and cached by the browser afterward.
 */
import { removeBackground } from "@imgly/background-removal";

/**
 * @param {File} file
 * @param {(progress: number) => void} [onProgress]
 * @returns {Promise<Blob>} a transparent PNG
 */
export async function removeImageBackground(file, onProgress) {
  const blob = await removeBackground(file, {
    model: "isnet_quint8", // quantized model — smaller download, faster inference
    output: { format: "image/png", quality: 0.9 },
    progress: (key, current, total) => {
      if (total > 0) onProgress?.(current / total);
    },
  });
  return blob;
}
