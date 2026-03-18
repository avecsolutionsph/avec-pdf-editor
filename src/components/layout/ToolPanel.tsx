import { useToolStore } from '../../store/tool.store'
import type { ToolMode } from '../../types/tool.types'

interface ToolButtonProps {
  mode: ToolMode
  label: string
  emoji: string
  active: boolean
  onClick: () => void
}

function ToolButton({ label, emoji, active, onClick }: ToolButtonProps) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`w-9 h-9 flex items-center justify-center rounded-lg text-base transition-colors ${
        active
          ? 'bg-red-100 text-red-700 border border-red-300'
          : 'text-gray-500 hover:bg-gray-100 border border-transparent'
      }`}
    >
      {emoji}
    </button>
  )
}

export function ToolPanel() {
  const { activeTool, setTool } = useToolStore()

  const tools: Array<{ mode: ToolMode; label: string; emoji: string }> = [
    { mode: 'select', label: 'Select', emoji: '↖' },
    { mode: 'hand', label: 'Pan', emoji: '✋' },
    { mode: 'text-edit', label: 'Edit Text', emoji: 'T' },
    { mode: 'highlight', label: 'Highlight', emoji: '🖊' },
    { mode: 'sticky-note', label: 'Sticky Note', emoji: '📝' },
    { mode: 'draw', label: 'Draw', emoji: '✏️' },
    { mode: 'shape', label: 'Shape', emoji: '⬜' },
    { mode: 'text-box', label: 'Text Box', emoji: '⌨' },
    { mode: 'form-fill', label: 'Fill Form', emoji: '📋' },
    { mode: 'sign', label: 'Sign', emoji: '🖋' },
  ]

  return (
    <div className="flex flex-col gap-1 p-1.5 border-r border-gray-200 bg-white shrink-0">
      {tools.map((tool, i) => (
        <div key={tool.mode}>
          {/* Dividers between groups */}
          {(i === 2 || i === 8) && (
            <div className="w-full h-px bg-gray-200 my-1" />
          )}
          <ToolButton
            mode={tool.mode}
            label={tool.label}
            emoji={tool.emoji}
            active={activeTool === tool.mode}
            onClick={() => setTool(tool.mode)}
          />
        </div>
      ))}
    </div>
  )
}
