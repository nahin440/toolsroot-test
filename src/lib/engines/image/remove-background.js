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
    // Full-precision model — meaningfully more accurate edges/detail than
    // the quantized (isnet_quint8) or half-precision (isnet_fp16) variants,
    // at the cost of a larger one-time model download and slower inference.
    // Chosen deliberately for output quality over speed.
    model: "isnet",
    // GPU acceleration via WebGPU. The library feature-detects real
    // WebGPU support itself (see createOnnxSession in
    // @imgly/background-removal) and transparently falls back to the
    // WASM/CPU path when it's unavailable, so this is a pure speed win
    // with no correctness or quality risk on browsers/devices that don't
    // support it — it never fails or errors, just runs the same isnet
    // model on CPU instead.
    device: "gpu",
    output: { format: "image/png", quality: 0.9 },
    progress: (key, current, total) => {
      if (total > 0) onProgress?.(current / total);
    },
  });
  return blob;
}
