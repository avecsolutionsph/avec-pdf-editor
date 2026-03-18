import { useState } from 'react'
import { PdfCanvas } from './PdfCanvas'
import { AnnotationOverlay } from '../annotations/AnnotationOverlay'
import { useHighlight } from '../../hooks/useHighlight'
import { useToolStore } from '../../store/tool.store'

interface Props {
  pageIndex: number
  scale: number
  pageWidth: number
  pageHeight: number
  isVisible: boolean
}

export function PdfPage({ pageIndex, scale, pageWidth, pageHeight, isVisible }: Props) {
  const [rendered, setRendered] = useState(false)
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 })
  const { activeTool } = useToolStore()
  const { containerRef: highlightRef, handleMouseUp: handleHighlightMouseUp } = useHighlight(pageIndex)

  const scaledWidth = pageWidth * scale
  const scaledHeight = pageHeight * scale

  return (
    <div
      className="relative mx-auto mb-8 shadow-lg"
      style={{ width: scaledWidth, height: scaledHeight }}
    >
      {/* Page number label */}
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

      {/* Text layer — enables text selection for highlight tool */}
      <div
        ref={highlightRef}
        className="absolute inset-0"
        onMouseUp={handleHighlightMouseUp}
        style={{
          userSelect: activeTool === 'highlight' ? 'text' : 'none',
          cursor: activeTool === 'highlight' ? 'text' : undefined,
          // Allow mouse events through to Konva except when highlighting
          pointerEvents: activeTool === 'highlight' ? 'auto' : 'none',
        }}
      />

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
