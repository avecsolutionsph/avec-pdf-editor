import { create } from 'zustand'
import type { PdfPageInfo } from '../types/pdf.types'

interface DocumentState {
  fileName: string | null
  bytes: Uint8Array | null
  pageCount: number
  pages: PdfPageInfo[]
  isProtected: boolean
  isModified: boolean
  currentPage: number

  setDocument: (fileName: string, bytes: Uint8Array, pages: PdfPageInfo[]) => void
  setBytes: (bytes: Uint8Array) => void
  setCurrentPage: (page: number) => void
  setModified: (modified: boolean) => void
  setProtected: (isProtected: boolean) => void
  updatePages: (pages: PdfPageInfo[]) => void
  clearDocument: () => void
}

export const useDocumentStore = create<DocumentState>()((set) => ({
  fileName: null,
  bytes: null,
  pageCount: 0,
  pages: [],
  isProtected: false,
  isModified: false,
  currentPage: 1,

  setDocument: (fileName, bytes, pages) =>
    set({
      fileName,
      bytes,
      pages,
      pageCount: pages.length,
      isProtected: false,
      isModified: false,
      currentPage: 1,
    }),

  setBytes: (bytes) => set({ bytes, isModified: true }),

  setCurrentPage: (currentPage) => set({ currentPage }),

  setModified: (isModified) => set({ isModified }),

  setProtected: (isProtected) => set({ isProtected }),

  updatePages: (pages) => set({ pages, pageCount: pages.length }),

  clearDocument: () =>
    set({
      fileName: null,
      bytes: null,
      pageCount: 0,
      pages: [],
      isProtected: false,
      isModified: false,
      currentPage: 1,
    }),
}))
