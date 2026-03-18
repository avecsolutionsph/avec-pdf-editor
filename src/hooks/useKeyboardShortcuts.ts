import { useEffect } from 'react'
import { useAnnotationStore } from '../store/annotation.store'
import { useHistoryStore } from '../store/history.store'
import { useDocumentStore } from '../store/document.store'
import { loadPdfDocument } from '../services/pdf-renderer.service'

export function useKeyboardShortcuts() {
  const { selectedId, removeAnnotation, selectAnnotation } = useAnnotationStore()
  const { undo, redo, canUndo, canRedo } = useHistoryStore()
  const { fileName } = useDocumentStore()

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      // Don't intercept when typing in inputs
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return

      const isMac = navigator.platform.includes('Mac')
      const mod = isMac ? e.metaKey : e.ctrlKey

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedId) {
          removeAnnotation(selectedId)
          selectAnnotation(null)
        }
      }

      if (e.key === 'Escape') {
        selectAnnotation(null)
      }

      if (mod && e.key === 'z' && !e.shiftKey && canUndo()) {
        e.preventDefault()
        const prev = undo()
        if (prev && fileName) {
          loadPdfDocument(prev).then(({ pages }) => {
            useDocumentStore.getState().setDocument(fileName, prev, pages)
          })
        }
      }

      if (mod && (e.key === 'y' || (e.key === 'z' && e.shiftKey)) && canRedo()) {
        e.preventDefault()
        const next = redo()
        if (next && fileName) {
          loadPdfDocument(next).then(({ pages }) => {
            useDocumentStore.getState().setDocument(fileName, next, pages)
          })
        }
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedId, removeAnnotation, selectAnnotation, undo, redo, canUndo, canRedo, fileName])
}
