import { useState } from 'react'
import { useDocumentStore } from '../../store/document.store'

export function PageNavigation() {
  const { currentPage, pageCount, setCurrentPage } = useDocumentStore()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  const atFirst = currentPage <= 1
  const atLast = currentPage >= pageCount

  const goTo = (page: number) => {
    const clamped = Math.max(1, Math.min(page, pageCount))
    setCurrentPage(clamped)
  }

  const handleInputCommit = () => {
    const val = parseInt(draft, 10)
    if (!isNaN(val)) goTo(val)
    setEditing(false)
  }

  return (
    <div className="flex items-center gap-0.5">
      {/* Previous */}
      <button
        onClick={() => goTo(currentPage - 1)}
        disabled={atFirst}
        className={[
          'w-7 h-7 flex items-center justify-center rounded-lg transition-colors duration-150',
          atFirst
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800 active:bg-gray-200 cursor-pointer',
        ].join(' ')}
        title="Previous page"
        aria-label="Previous page"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="8,2 4,6 8,10" />
        </svg>
      </button>

      {/* Page input / display */}
      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-colors duration-150">
        {editing ? (
          <input
            autoFocus
            type="number"
            value={draft}
            min={1}
            max={pageCount}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={handleInputCommit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleInputCommit()
              if (e.key === 'Escape') setEditing(false)
            }}
            className="w-8 text-center text-xs py-1 outline-none bg-transparent tabular-nums"
            aria-label="Go to page"
          />
        ) : (
          <button
            onClick={() => { setDraft(String(currentPage)); setEditing(true) }}
            className="w-8 text-center text-xs py-1 outline-none bg-transparent tabular-nums cursor-text hover:bg-gray-50 transition-colors duration-100"
            title="Click to jump to page"
          >
            {currentPage}
          </button>
        )}
        <span className="text-xs text-gray-400 pr-1.5 select-none">/{pageCount}</span>
      </div>

      {/* Next */}
      <button
        onClick={() => goTo(currentPage + 1)}
        disabled={atLast}
        className={[
          'w-7 h-7 flex items-center justify-center rounded-lg transition-colors duration-150',
          atLast
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800 active:bg-gray-200 cursor-pointer',
        ].join(' ')}
        title="Next page"
        aria-label="Next page"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="4,2 8,6 4,10" />
        </svg>
      </button>
    </div>
  )
}
