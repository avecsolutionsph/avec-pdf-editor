import { useCallback, useRef } from 'react'
import { useAnnotationStore } from '../store/annotation.store'
import { useToolStore } from '../store/tool.store'
import type { HighlightAnnotation } from '../types/annotation.types'
import { nanoid } from '../components/annotations/nanoid'

/**
 * Attaches to the text layer div and handles highlight creation via native
 * text selection (mousedown → mouseup → getSelection).
 */
export function useHighlight(pageIndex: number) {
  const { activeTool, options } = useToolStore()
  const { addAnnotation } = useAnnotationStore()
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseUp = useCallback(() => {
    if (activeTool !== 'highlight') return

    const selection = window.getSelection()
    if (!selection || selection.isCollapsed || !containerRef.current) return

    const range = selection.getRangeAt(0)
    const containerRect = containerRef.current.getBoundingClientRect()
    const clientRects = Array.from(range.getClientRects())

    if (!clientRects.length) return

    // Convert client rects to coordinates relative to the page container
    const rects = clientRects
      .filter((r) => r.width > 0 && r.height > 0)
      .map((r) => ({
        x: r.left - containerRect.left,
        y: r.top - containerRect.top,
        width: r.width,
        height: r.height,
      }))

    if (!rects.length) return

    const annotation: HighlightAnnotation = {
      id: nanoid(),
      type: 'highlight',
      pageIndex,
      color: options.color,
      opacity: options.opacity,
      createdAt: Date.now(),
      rects,
    }

    addAnnotation(annotation)
    selection.removeAllRanges()
  }, [activeTool, options, pageIndex, addAnnotation])

  return { containerRef, handleMouseUp }
}
