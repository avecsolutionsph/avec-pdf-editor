import { useRef, useEffect, useState, useCallback } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { PdfPage } from './PdfPage'
import { useDocumentStore } from '../../store/document.store'
import { useUiStore } from '../../store/ui.store'
import type { DetectedFont } from '../../services/font-detection.service'

const PAGE_GAP = 16 // px between pages
const PAGE_PADDING = 32 // px horizontal padding

interface Props {
  onActiveFont?: (font: DetectedFont | null) => void
}

export function PdfViewer({ onActiveFont }: Props) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const { pages } = useDocumentStore()
  const { zoom, setZoom } = useUiStore()
  const [containerWidth, setContainerWidth] = useState(0)

  // Observe container width for fit-to-width zoom
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return
    const ro = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width)
    })
    ro.observe(container)
    return () => ro.disconnect()
  }, [])

  // Fit-to-width: auto-compute zoom from first page width
  useEffect(() => {
    if (!containerWidth || !pages[0]) return
    const availableWidth = containerWidth - PAGE_PADDING * 2
    const fitZoom = availableWidth / pages[0].width
    setZoom(Math.min(Math.max(fitZoom, 0.1), 5))
  }, [containerWidth, pages[0]?.width])

  // Ctrl+Wheel to zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!e.ctrlKey && !e.metaKey) return
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    useUiStore.setState((s) => ({
      zoom: Math.min(Math.max(s.zoom + delta, 0.1), 5),
      fitMode: 'custom',
    }))
  }, [])

  // Estimate row heights for virtualizer
  const getPageHeight = (i: number) => (pages[i]?.height ?? 800) * zoom + PAGE_GAP

  const virtualizer = useVirtualizer({
    count: pages.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: getPageHeight,
    overscan: 2,
  })

  if (!pages.length) return null

  return (
    <div
      ref={scrollContainerRef}
      className="flex-1 overflow-auto bg-gray-200 relative"
      onWheel={handleWheel}
    >
      <div
        style={{
          height: virtualizer.getTotalSize(),
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const page = pages[virtualRow.index]
          return (
            <div
              key={virtualRow.index}
              style={{
                position: 'absolute',
                top: virtualRow.start,
                left: 0,
                width: '100%',
                height: virtualRow.size,
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                paddingTop: PAGE_GAP / 2,
              }}
            >
              <PdfPage
                pageIndex={page.index}
                scale={zoom}
                pageWidth={page.width}
                pageHeight={page.height}
                isVisible
                onActiveFont={onActiveFont}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
