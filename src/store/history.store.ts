import { create } from 'zustand'

const MAX_HISTORY = 20
const MAX_PDF_SIZE_FOR_FULL_HISTORY = 50 * 1024 * 1024 // 50MB

interface HistoryState {
  undoStack: Uint8Array[]
  redoStack: Uint8Array[]

  pushSnapshot: (bytes: Uint8Array) => void
  undo: () => Uint8Array | null
  redo: () => Uint8Array | null
  clearHistory: () => void
  canUndo: () => boolean
  canRedo: () => boolean
}

export const useHistoryStore = create<HistoryState>()((set, get) => ({
  undoStack: [],
  redoStack: [],

  pushSnapshot: (bytes) => {
    const limit = bytes.byteLength > MAX_PDF_SIZE_FOR_FULL_HISTORY ? 5 : MAX_HISTORY
    set((s) => ({
      undoStack: [...s.undoStack, bytes].slice(-limit),
      redoStack: [],
    }))
  },

  undo: () => {
    const { undoStack, redoStack } = get()
    if (undoStack.length < 2) return null
    const current = undoStack[undoStack.length - 1]
    const previous = undoStack[undoStack.length - 2]
    set({
      undoStack: undoStack.slice(0, -1),
      redoStack: [...redoStack, current],
    })
    return previous
  },

  redo: () => {
    const { undoStack, redoStack } = get()
    if (redoStack.length === 0) return null
    const next = redoStack[redoStack.length - 1]
    set({
      undoStack: [...undoStack, next],
      redoStack: redoStack.slice(0, -1),
    })
    return next
  },

  clearHistory: () => set({ undoStack: [], redoStack: [] }),
  canUndo: () => get().undoStack.length > 1,
  canRedo: () => get().redoStack.length > 0,
}))
