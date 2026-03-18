import { useState, useCallback, useRef } from 'react'
import { getPageTextItems, hitTestTextItem } from '../services/font-detection.service'
import type { DetectedTextItem } from '../services/font-detection.service'
import { useDocumentStore } from '../store/document.store'
import { useUiStore } from '../store/ui.store'
import { applyTextEdits } from '../services/text-edit.service'
import { loadPdfDocument } from '../services/pdf-renderer.service'
import { useHistoryStore } from '../store/history.store'

export interface ActiveEdit {
  item: DetectedTextItem
  draftText: string
}

export function useTextEditor(pageIndex: number) {
  const { bytes, fileName, pages, setDocument } = useDocumentStore()
  const { zoom } = useUiStore()
  const [activeEdit, setActiveEdit] = useState<ActiveEdit | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const pendingEdits = useRef<Map<string, { item: DetectedTextItem; newText: string }>>(new Map())

  const page = pages[pageIndex]
  const pageHeight = page?.height ?? 800

  /** Called on click in text-edit mode */
  const handlePageClick = useCallback(async (clickX: number, clickY: number) => {
    if (!bytes || !page) return
    setIsLoading(true)

    try {
      const items = await getPageTextItems(pageIndex, zoom, pageHeight)
      const hit = hitTestTextItem(items, clickX, clickY)

      if (hit) {
        setActiveEdit({ item: hit, draftText: hit.text })
      } else {
        // Click on empty area — commit any pending edit first
        await commitActiveEdit()
      }
    } finally {
      setIsLoading(false)
    }
  }, [bytes, page, pageIndex, zoom, pageHeight])

  /** Called when the overlay textarea changes */
  const handleDraftChange = useCallback((text: string) => {
    setActiveEdit((prev) => prev ? { ...prev, draftText: text } : null)
  }, [])

  /** Commit the current edit to pending edits map, clear active */
  const commitActiveEdit = useCallback(async () => {
    if (!activeEdit) return
    const { item, draftText } = activeEdit

    // Only store if text actually changed
    if (draftText !== item.text) {
      const key = `${pageIndex}-${item.pdfRect.x}-${item.pdfRect.y}`
      pendingEdits.current.set(key, { item, newText: draftText })
    }

    setActiveEdit(null)
  }, [activeEdit, pageIndex])

  /** Flush all pending edits to the PDF bytes */
  const flushEdits = useCallback(async () => {
    if (!bytes || !fileName || pendingEdits.current.size === 0) return

    const edits = Array.from(pendingEdits.current.values()).map(({ item, newText }) => ({
      pageIndex,
      original: item,
      newText,
    }))

    const newBytes = await applyTextEdits(bytes, edits)
    const { pages: newPages } = await loadPdfDocument(newBytes)
    setDocument(fileName, newBytes, newPages)
    useHistoryStore.getState().pushSnapshot(newBytes)
    pendingEdits.current.clear()
  }, [bytes, fileName, pageIndex])

  return {
    activeEdit,
    isLoading,
    handlePageClick,
    handleDraftChange,
    commitActiveEdit,
    flushEdits,
  }
}
