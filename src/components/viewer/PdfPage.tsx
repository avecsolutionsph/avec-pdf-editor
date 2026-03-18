import { useState, useRef, useCallback } from 'react'
import { PdfCanvas } from './PdfCanvas'
import { AnnotationOverlay } from '../annotations/AnnotationOverlay'
import { FormFieldOverlay } from '../forms/FormFieldOverlay'
import { InlineTextEditor } from '../text-edit/InlineTextEditor'
import { useHighlight } from '../../hooks/useHighlight'
import { useTextEditor } from '../../hooks/useTextEditor'
import { useToolStore } from '../../store/tool.store'

interface Props {
  pageIndex: number
  scale: number
  pageWidth: number
  pageHeight: number
  isVisible: boolean
  onActiveFont?: (font: import('../../services/font-detection.service').DetectedFont | null) => void
}

export function PdfPage({ pageIndex, scale, pageWidth, pageHeight, isVisible, onActiveFont }: Props) {
  const [rendered, setRendered] = useState(false)
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const { activeTool } = useToolStore()
  const { containerRef: highlightRef, handleMouseUp: handleHighlightMouseUp } = useHighlight(pageIndex)
  const { activeEdit, handlePageClick, handleDraftChange, commitActiveEdit, flushEdits } = useTextEditor(pageIndex)

  const scaledWidth = pageWidth * scale
  const scaledHeight = pageHeight * scale

  // Notify parent of active font for toolbar indicator
  const prevFont = useRef<string>('')
  if (activeEdit) {
    const key = activeEdit.item.font.rawName
    if (key !== prevFont.current) {
      prevFont.current = key
      onActiveFont?.(activeEdit.item.font)
    }
  } else if (prevFont.current) {
    prevFont.current = ''
    onActiveFont?.(null)
  }

  const handleContainerClick = useCallback(async (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool !== 'text-edit') return
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    await handlePageClick(x, y)
  }, [activeTool, handlePageClick])

  // Flush edits when switching away from text-edit tool
  const prevTool = useRef(activeTool)
  if (prevTool.current === 'text-edit' && activeTool !== 'text-edit') {
    prevTool.current = activeTool
    flushEdits()
  } else {
    prevTool.current = activeTool
  }

  return (
    <div
      ref={containerRef}
      className="relative mx-auto mb-8 shadow-lg"
      style={{ width: scaledWidth, height: scaledHeight }}
      onClick={handleContainerClick}
    >
      {/* Page number */}
      <div className="absolute -bottom-5 left-0 right-0 text-center text-xs text-gray-400 select-none pointer-events-none">
        {pageIndex + 1}
      </div>

      {/* Loading skeleton */}
      {!rendered && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse rounded-sm" />
      )}

      {/* PDF canvas */}
      {isVisible && (
        <PdfCanvas
          pageIndex={pageIndex}
          scale={scale}
          onRendered={(w, h) => {
            setRendered(true)
            setCanvasSize({ w, h })
          }}
        />
      )}

      {/* Text selection layer (highlight tool) */}
      <div
        ref={highlightRef}
        className="absolute inset-0"
        onMouseUp={handleHighlightMouseUp}
        style={{
          userSelect: activeTool === 'highlight' ? 'text' : 'none',
          cursor: activeTool === 'highlight' ? 'text' : undefined,
          pointerEvents: activeTool === 'highlight' ? 'auto' : 'none',
        }}
      />

      {/* Form field HTML overlay */}
      {rendered && <FormFieldOverlay pageIndex={pageIndex} />}

      {/* Inline text editor — shown when a text item is active */}
      {rendered && activeEdit && (
        <InlineTextEditor
          activeEdit={activeEdit}
          onDraftChange={handleDraftChange}
          onCommit={commitActiveEdit}
          onCancel={() => commitActiveEdit()}
        />
      )}

      {/* Text edit cursor overlay — makes the whole page show text cursor in edit mode */}
      {activeTool === 'text-edit' && rendered && !activeEdit && (
        <div
          className="absolute inset-0"
          style={{ cursor: 'text', pointerEvents: 'none' }}
        />
      )}

      {/* Konva annotation overlay */}
      {rendered && (
        <AnnotationOverlay
          pageIndex={pageIndex}
          width={canvasSize.w || scaledWidth}
          height={canvasSize.h || scaledHeight}
        />
      )}
    </div>
  )
}
