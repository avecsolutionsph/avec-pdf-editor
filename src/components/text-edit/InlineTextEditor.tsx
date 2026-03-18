import { useRef, useEffect } from 'react'
import type { ActiveEdit } from '../../hooks/useTextEditor'

interface Props {
  activeEdit: ActiveEdit
  onDraftChange: (text: string) => void
  onCommit: () => void
  onCancel: () => void
}

export function InlineTextEditor({ activeEdit, onDraftChange, onCommit, onCancel }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { item, draftText } = activeEdit
  const { screenRect, font } = item

  // Auto-focus and select all on mount
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.focus()
    el.select()
  }, [])

  // Auto-grow height as content changes
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.max(el.scrollHeight, screenRect.height)}px`
  }, [draftText, screenRect.height])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      onCancel()
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onCommit()
    }
  }

  return (
    <>
      {/* Scrim — click outside to commit */}
      <div
        className="fixed inset-0 z-40"
        onMouseDown={(e) => {
          e.preventDefault()
          onCommit()
        }}
      />

      {/* Font match indicator badge */}
      <div
        className="absolute z-50 pointer-events-none"
        style={{
          left: screenRect.x,
          top: Math.max(0, screenRect.y - 22),
        }}
      >
        <div className="flex items-center gap-1.5 bg-gray-800 text-white text-[10px] px-2 py-0.5 rounded-full shadow">
          <span className="font-medium" style={{ fontFamily: font.cssFamily }}>
            {font.family}
          </span>
          <span className="text-gray-400">·</span>
          <span>{Math.round(font.size)}pt</span>
          {font.bold && <span className="text-blue-300 font-bold">B</span>}
          {font.italic && <span className="text-blue-300 italic">I</span>}
        </div>
      </div>

      {/* Matched textarea */}
      <textarea
        ref={textareaRef}
        value={draftText}
        onChange={(e) => onDraftChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className="absolute z-50"
        style={{
          left: screenRect.x - 2,
          top: screenRect.y - 2,
          width: Math.max(screenRect.width + 40, 120),
          minHeight: screenRect.height + 4,
          // Font matching — the key to seamless editing
          fontFamily: font.cssFamily,
          fontSize: font.size,
          fontWeight: font.bold ? 'bold' : 'normal',
          fontStyle: font.italic ? 'italic' : 'normal',
          color: font.color,
          lineHeight: 1.2,
          // Editor chrome
          padding: '2px 4px',
          border: '2px solid #3B82F6',
          borderRadius: 3,
          outline: 'none',
          resize: 'none',
          overflow: 'hidden',
          background: 'rgba(255, 255, 255, 0.97)',
          boxShadow: '0 2px 12px rgba(59,130,246,0.25)',
          whiteSpace: 'pre',
        }}
        spellCheck={false}
      />

      {/* Commit hint */}
      <div
        className="absolute z-50 pointer-events-none text-[9px] text-gray-400"
        style={{
          left: screenRect.x,
          top: screenRect.y + screenRect.height + 6,
        }}
      >
        Enter to confirm · Esc to cancel
      </div>
    </>
  )
}
