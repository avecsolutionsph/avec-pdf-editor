import { create } from 'zustand'
import type { Annotation } from '../types/annotation.types'

interface AnnotationState {
  annotations: Annotation[]
  selectedId: string | null

  addAnnotation: (annotation: Annotation) => void
  updateAnnotation: (id: string, updates: Partial<Annotation>) => void
  removeAnnotation: (id: string) => void
  selectAnnotation: (id: string | null) => void
  clearAnnotations: () => void
  getAnnotationsForPage: (pageIndex: number) => Annotation[]
}

export const useAnnotationStore = create<AnnotationState>()((set, get) => ({
  annotations: [],
  selectedId: null,

  addAnnotation: (annotation) =>
    set((s) => ({ annotations: [...s.annotations, annotation] })),

  updateAnnotation: (id, updates) =>
    set((s) => ({
      annotations: s.annotations.map((a) =>
        a.id === id ? ({ ...a, ...updates } as Annotation) : a
      ),
    })),

  removeAnnotation: (id) =>
    set((s) => ({
      annotations: s.annotations.filter((a) => a.id !== id),
      selectedId: s.selectedId === id ? null : s.selectedId,
    })),

  selectAnnotation: (selectedId) => set({ selectedId }),

  clearAnnotations: () => set({ annotations: [], selectedId: null }),

  getAnnotationsForPage: (pageIndex) =>
    get().annotations.filter((a) => a.pageIndex === pageIndex),
}))
