import { useState } from 'react'
import { PdfCanvas } from './PdfCanvas'

interface Props {
  pageIndex: number
  scale: number
  pageWidth: number
  pageHeight: number
  isVisible: boolean
}

export function PdfPage({ pageIndex, scale, pageWidth, pageHeight, isVisible }: Props) {
  const [rendered, setRendered] = useState(false)

  const scaledWidth = pageWidth * scale
  const scaledHeight = pageHeight * scale

  return (
    <div
      className="relative mx-auto mb-4 shadow-lg bg-white"
      style={{ width: scaledWidth, height: scaledHeight }}
    >
      {/* Page number label */}
      <div className="absolute -bottom-6 left-0 right-0 text-center text-xs text-gray-400 select-none">
        {pageIndex + 1}
      </div>

      {/* Loading skeleton */}
      {!rendered && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse" />
      )}

      {/* PDF canvas */}
      {isVisible && (
        <PdfCanvas
          pageIndex={pageIndex}
          scale={scale}
          onRendered={() => setRendered(true)}
        />
      )}

      {/* Annotation overlay placeholder — will host Konva Stage */}
      <div
        className="absolute inset-0 pointer-events-none"
        id={`annotation-overlay-${pageIndex}`}
      />
    </div>
  )
}
