import { useToolStore } from '../../store/tool.store'
import { useUiStore } from '../../store/ui.store'
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

const ANNOTATION_TOOLS: ToolMode[] = ['highlight', 'sticky-note', 'draw', 'shape', 'text-box']

export function ToolPanel() {
  const { activeTool, setTool } = useToolStore()
  const { propertiesPanelOpen, togglePropertiesPanel } = useUiStore()

  const handleSetTool = (mode: ToolMode) => {
    setTool(mode)
    // Auto-open properties panel for annotation tools
    if (ANNOTATION_TOOLS.includes(mode) && !propertiesPanelOpen) {
      togglePropertiesPanel()
    }
    // Close properties panel for navigation tools
    if ((mode === 'select' || mode === 'hand') && propertiesPanelOpen) {
      togglePropertiesPanel()
    }
  }

  const tools: Array<{ mode: ToolMode; label: string; emoji: string }> = [
    { mode: 'select', label: 'Select (V)', emoji: '↖' },
    { mode: 'hand', label: 'Pan (H)', emoji: '✋' },
    { mode: 'text-edit', label: 'Edit Text (T)', emoji: 'Tₐ' },
    { mode: 'highlight', label: 'Highlight (U)', emoji: '🖊' },
    { mode: 'sticky-note', label: 'Sticky Note (N)', emoji: '📝' },
    { mode: 'draw', label: 'Draw (P)', emoji: '✏️' },
    { mode: 'shape', label: 'Shape (S)', emoji: '⬜' },
    { mode: 'text-box', label: 'Text Box (X)', emoji: '⌨' },
    { mode: 'form-fill', label: 'Fill Form (F)', emoji: '📋' },
    { mode: 'sign', label: 'Sign (G)', emoji: '🖋' },
  ]

  return (
    <div className="flex flex-col gap-1 p-1.5 border-r border-gray-200 bg-white shrink-0">
      {tools.map((tool, i) => (
        <div key={tool.mode}>
          {(i === 2 || i === 8) && <div className="w-full h-px bg-gray-200 my-1" />}
          <ToolButton
            mode={tool.mode}
            label={tool.label}
            emoji={tool.emoji}
            active={activeTool === tool.mode}
            onClick={() => handleSetTool(tool.mode)}
          />
        </div>
      ))}
    </div>
  )
}
