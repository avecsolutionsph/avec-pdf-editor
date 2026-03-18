import { useEffect, useState } from 'react'
import { useDocumentStore } from '../../store/document.store'
import { useUiStore } from '../../store/ui.store'
import { renderPageThumbnail } from '../../services/pdf-renderer.service'

export function Sidebar() {
  const { pages, currentPage, setCurrentPage } = useDocumentStore()
  const { sidebarOpen, thumbnailPanelWidth } = useUiStore()
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({})

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
        // Yield to keep UI responsive
        await new Promise((r) => setTimeout(r, 0))
      }
    }
    render()
    return () => { cancelled = true }
  }, [pages])

  if (!sidebarOpen) return null

  return (
    <div
      className="flex flex-col border-r border-gray-200 bg-gray-50 shrink-0 overflow-y-auto"
      style={{ width: thumbnailPanelWidth }}
    >
      <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-200">
        Pages
      </div>
      <div className="flex flex-col gap-2 p-2">
        {pages.map((page) => (
          <button
            key={page.index}
            onClick={() => setCurrentPage(page.index + 1)}
            className={`flex flex-col items-center gap-1 p-1.5 rounded-md border-2 transition-colors ${
              currentPage === page.index + 1
                ? 'border-red-500 bg-red-50'
                : 'border-transparent hover:border-gray-300 hover:bg-white'
            }`}
          >
            {thumbnails[page.index] ? (
              <img
                src={thumbnails[page.index]}
                alt={`Page ${page.index + 1}`}
                className="w-full rounded shadow-sm"
                style={{ aspectRatio: `${page.width} / ${page.height}` }}
              />
            ) : (
              <div
                className="w-full bg-gray-200 animate-pulse rounded"
                style={{
                  aspectRatio: `${page.width} / ${page.height}`,
                }}
              />
            )}
            <span className="text-xs text-gray-500">{page.index + 1}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
