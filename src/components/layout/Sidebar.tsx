import { useEffect, useState } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useDocumentStore } from '../../store/document.store'
import { useUiStore } from '../../store/ui.store'
import { useHistoryStore } from '../../store/history.store'
import { renderPageThumbnail, loadPdfDocument } from '../../services/pdf-renderer.service'
import { reorderPages, deletePage, duplicatePage } from '../../services/page-organizer.service'
import type { PdfPageInfo } from '../../types/pdf.types'

// ── Sortable page thumbnail item ─────────────────────────────────────────────

interface PageItemProps {
  page: PdfPageInfo
  thumbnail: string | undefined
  isActive: boolean
  isDragging?: boolean
  onSelect: () => void
  onDelete: () => void
  onDuplicate: () => void
}

function PageItem({
  page,
  thumbnail,
  isActive,
  isDragging = false,
  onSelect,
  onDelete,
  onDuplicate,
}: PageItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortDragging } =
    useSortable({ id: page.index })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortDragging ? 0.4 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group"
    >
      <button
        onClick={onSelect}
        title={`Go to page ${page.index + 1}`}
        className={`w-full flex flex-col items-center gap-1 p-1.5 rounded-md border-2 cursor-pointer transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-1 ${
          isActive
            ? 'border-red-500 bg-red-50 shadow-sm'
            : 'border-transparent hover:border-red-300 hover:bg-white hover:shadow-md hover:-translate-y-px'
        } ${isDragging ? 'shadow-xl scale-105' : ''}`}
      >
        {/* Thumbnail */}
        <div className="relative w-full overflow-hidden rounded shadow-sm">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={`Page ${page.index + 1}`}
              className="w-full rounded"
              style={{ aspectRatio: `${page.width} / ${page.height}` }}
            />
          ) : (
            <div
              className="w-full bg-gray-200 animate-pulse rounded"
              style={{ aspectRatio: `${page.width} / ${page.height}` }}
            />
          )}
          {/* Hover overlay tint */}
          {!isActive && (
            <div className="absolute inset-0 bg-red-500 opacity-0 group-hover:opacity-5 rounded transition-opacity duration-150" />
          )}
        </div>

        {/* Page number */}
        <span
          className={`text-xs font-medium transition-colors duration-150 ${
            isActive ? 'text-red-600' : 'text-gray-400 group-hover:text-gray-600'
          }`}
        >
          {page.index + 1}
        </span>
      </button>

      {/* Drag handle (top-left) */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity duration-150 cursor-grab active:cursor-grabbing p-0.5 rounded bg-white/80 shadow-sm"
        title="Drag to reorder"
        onClick={(e) => e.stopPropagation()}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" className="text-gray-500">
          <circle cx="3" cy="2.5" r="1" />
          <circle cx="7" cy="2.5" r="1" />
          <circle cx="3" cy="5" r="1" />
          <circle cx="7" cy="5" r="1" />
          <circle cx="3" cy="7.5" r="1" />
          <circle cx="7" cy="7.5" r="1" />
        </svg>
      </div>

      {/* Action buttons (top-right) */}
      <div className="absolute top-2 right-2 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <button
          onClick={(e) => { e.stopPropagation(); onDuplicate() }}
          title="Duplicate page"
          className="w-5 h-5 flex items-center justify-center rounded bg-white/90 shadow-sm text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-100"
        >
          <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="5.5" height="5.5" rx="0.75" />
            <path d="M2 6H1.5A.5.5 0 0 1 1 5.5V1.5A.5.5 0 0 1 1.5 1h4A.5.5 0 0 1 6 1.5V2" />
          </svg>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          title="Delete page"
          className="w-5 h-5 flex items-center justify-center rounded bg-white/90 shadow-sm text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors duration-100"
        >
          <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1,2.5 8,2.5" />
            <path d="M3,2.5V1.5h3V2.5" />
            <path d="M1.5,2.5l0.6,5.5h4.8l0.6-5.5" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// ── Main Sidebar ─────────────────────────────────────────────────────────────

export function Sidebar() {
  const { pages, currentPage, bytes, fileName, setDocument, setCurrentPage } = useDocumentStore()
  const { sidebarOpen, thumbnailPanelWidth } = useUiStore()
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({})
  const [activeDragId, setActiveDragId] = useState<number | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  )

  // Render thumbnails progressively
  useEffect(() => {
    if (!pages.length) return
    setThumbnails({})

    let cancelled = false
    const render = async () => {
      for (const page of pages) {
        if (cancelled) break
        const dataUrl = await renderPageThumbnail(page.index, 160)
        if (!cancelled) {
          setThumbnails((prev) => ({ ...prev, [page.index]: dataUrl }))
        }
        await new Promise((r) => setTimeout(r, 0))
      }
    }
    render()
    return () => { cancelled = true }
  }, [pages])

  const applyPageOperation = async (newBytes: Uint8Array, newCurrentPage: number) => {
    setIsProcessing(true)
    try {
      const { pages: newPages } = await loadPdfDocument(newBytes)
      setDocument(fileName ?? 'document.pdf', newBytes, newPages)
      useHistoryStore.getState().pushSnapshot(newBytes)
      // Clamp currentPage to valid range
      setCurrentPage(Math.max(1, Math.min(newCurrentPage, newPages.length)))
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as number)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveDragId(null)
    const { active, over } = event
    if (!over || active.id === over.id || !bytes) return

    const oldIndex = pages.findIndex((p) => p.index === active.id)
    const newIndex = pages.findIndex((p) => p.index === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    // Compute new page order based on visual reorder
    const reordered = arrayMove(pages, oldIndex, newIndex)
    const newOrder = reordered.map((p) => p.index)

    // Keep current page tracking: the page the user was on should follow
    const currentOriginalIndex = currentPage - 1
    const newCurrentVisualPos = reordered.findIndex((p) => p.index === currentOriginalIndex)

    const newBytes = await reorderPages(bytes, newOrder)
    await applyPageOperation(newBytes, newCurrentVisualPos + 1)
  }

  const handleDelete = async (pageIndex: number) => {
    if (!bytes || pages.length <= 1) return
    const newBytes = await deletePage(bytes, pageIndex)
    // Adjust current page: if we deleted the last page, go to new last
    const wasLast = pageIndex === pages.length - 1
    const newCurrentPage = wasLast ? pages.length - 1 : currentPage
    await applyPageOperation(newBytes, newCurrentPage)
  }

  const handleDuplicate = async (pageIndex: number) => {
    if (!bytes) return
    const newBytes = await duplicatePage(bytes, pageIndex)
    // Stay on the original page
    await applyPageOperation(newBytes, currentPage)
  }

  if (!sidebarOpen) return null

  const activeDragPage = activeDragId !== null ? pages.find((p) => p.index === activeDragId) : null

  return (
    <div
      className="flex flex-col border-r border-gray-200 bg-gray-50 shrink-0 overflow-y-auto"
      style={{ width: thumbnailPanelWidth }}
    >
      {/* Header */}
      <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-200 sticky top-0 bg-gray-50 z-10 flex items-center justify-between">
        <span>
          Pages
          {pages.length > 0 && (
            <span className="ml-1.5 font-normal normal-case text-gray-400">
              ({pages.length})
            </span>
          )}
        </span>
        {isProcessing && (
          <span className="w-3 h-3 rounded-full border-2 border-gray-300 border-t-red-500 animate-spin" />
        )}
      </div>

      {/* Empty state */}
      {pages.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-3 p-4 text-center select-none">
          <div className="w-12 h-12 rounded-xl bg-gray-200 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6 text-gray-400"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">No document open</p>
            <p className="text-xs text-gray-400 mt-0.5 leading-snug">
              Open a PDF to see page thumbnails here
            </p>
          </div>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={pages.map((p) => p.index)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-2 p-2">
              {pages.map((page) => (
                <PageItem
                  key={page.index}
                  page={page}
                  thumbnail={thumbnails[page.index]}
                  isActive={currentPage === page.index + 1}
                  onSelect={() => setCurrentPage(page.index + 1)}
                  onDelete={() => handleDelete(page.index)}
                  onDuplicate={() => handleDuplicate(page.index)}
                />
              ))}
            </div>
          </SortableContext>

          {/* Drag overlay — ghost image following cursor */}
          <DragOverlay>
            {activeDragPage && (
              <div className="rounded-md border-2 border-red-400 bg-white shadow-2xl p-1.5 opacity-90 rotate-1">
                {thumbnails[activeDragPage.index] ? (
                  <img
                    src={thumbnails[activeDragPage.index]}
                    alt=""
                    className="w-full rounded"
                    style={{
                      width: thumbnailPanelWidth - 24,
                      aspectRatio: `${activeDragPage.width} / ${activeDragPage.height}`,
                    }}
                  />
                ) : (
                  <div
                    className="bg-gray-200 rounded"
                    style={{
                      width: thumbnailPanelWidth - 24,
                      aspectRatio: `${activeDragPage.width} / ${activeDragPage.height}`,
                    }}
                  />
                )}
              </div>
            )}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  )
}
