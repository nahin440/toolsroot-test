"use client";

import { create } from "zustand";

/**
 * The 8 states every tool's upload/processing flow must expose, per the
 * product's upload UX spec: idle, dragging-over, uploading, validating,
 * queued, processing, completed, error. A single store (rather than
 * per-component state) means the same Dropzone, ProgressPanel, and
 * ResultPanel components work identically across every one of the 40+
 * tool pages without each page reinventing this state machine.
 */
export const FILE_STATUS = {
  IDLE: "idle",
  DRAG_OVER: "drag-over",
  VALIDATING: "validating",
  QUEUED: "queued",
  UPLOADING: "uploading",
  PROCESSING: "processing",
  COMPLETED: "completed",
  ERROR: "error",
};

let nextId = 1;

export const useFileProcessingStore = create((set, get) => ({
  status: FILE_STATUS.IDLE,
  files: [], // { id, file, name, size, type, progress, error, resultBlob, resultName, meta }
  isDraggingOver: false,
  globalError: null,
  stage: null, // human-readable current stage label, e.g. "Extracting text, images, and tables"
  overallProgress: 0,

  setDraggingOver: (val) =>
    set({ isDraggingOver: val, status: val ? FILE_STATUS.DRAG_OVER : get().status === FILE_STATUS.DRAG_OVER ? FILE_STATUS.IDLE : get().status }),

  addFiles: (fileList) => {
    const entries = Array.from(fileList).map((file) => ({
      id: nextId++,
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      progress: 0,
      error: null,
      resultBlob: null,
      resultName: null,
      meta: {},
    }));
    set((state) => ({
      files: [...state.files, ...entries],
      status: FILE_STATUS.VALIDATING,
      isDraggingOver: false,
    }));
    return entries;
  },

  removeFile: (id) =>
    set((state) => ({
      files: state.files.filter((f) => f.id !== id),
      status: state.files.length <= 1 ? FILE_STATUS.IDLE : state.status,
    })),

  reorderFiles: (fromIdx, toIdx) =>
    set((state) => {
      const next = [...state.files];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return { files: next };
    }),

  clearAll: () =>
    set({
      files: [],
      status: FILE_STATUS.IDLE,
      globalError: null,
      stage: null,
      overallProgress: 0,
    }),

  setStatus: (status) => set({ status }),

  setQueued: () => set({ status: FILE_STATUS.QUEUED }),

  setStage: (stage, overallProgress) =>
    set({ stage, overallProgress: overallProgress ?? get().overallProgress, status: FILE_STATUS.PROCESSING }),

  setFileProgress: (id, progress) =>
    set((state) => ({
      files: state.files.map((f) => (f.id === id ? { ...f, progress } : f)),
    })),

  setFileResult: (id, resultBlob, resultName, meta = {}) =>
    set((state) => ({
      files: state.files.map((f) => (f.id === id ? { ...f, resultBlob, resultName, progress: 100, meta } : f)),
    })),

  setFileError: (id, error) =>
    set((state) => ({
      files: state.files.map((f) => (f.id === id ? { ...f, error } : f)),
      status: FILE_STATUS.ERROR,
    })),

  setGlobalError: (error) => set({ globalError: error, status: error ? FILE_STATUS.ERROR : get().status }),

  setCompleted: () => set({ status: FILE_STATUS.COMPLETED, stage: null }),

  retry: () => set({ status: FILE_STATUS.IDLE, globalError: null }),
}));
