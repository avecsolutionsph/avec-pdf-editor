import type { ToolMode } from '../types/tool.types'

export interface ToolMeta {
  mode: ToolMode
  label: string
  icon: string
  shortcut: string
  group: 'navigation' | 'annotation' | 'editing' | 'form'
}

export const TOOLS: ToolMeta[] = [
  { mode: 'select', label: 'Select', icon: 'cursor', shortcut: 'V', group: 'navigation' },
  { mode: 'hand', label: 'Pan', icon: 'hand', shortcut: 'H', group: 'navigation' },
  { mode: 'text-edit', label: 'Edit Text', icon: 'type', shortcut: 'T', group: 'editing' },
  { mode: 'highlight', label: 'Highlight', icon: 'highlighter', shortcut: 'U', group: 'annotation' },
  { mode: 'sticky-note', label: 'Sticky Note', icon: 'sticky-note', shortcut: 'N', group: 'annotation' },
  { mode: 'draw', label: 'Draw', icon: 'pencil', shortcut: 'P', group: 'annotation' },
  { mode: 'shape', label: 'Shape', icon: 'shapes', shortcut: 'S', group: 'annotation' },
  { mode: 'text-box', label: 'Text Box', icon: 'text-cursor', shortcut: 'X', group: 'annotation' },
  { mode: 'form-fill', label: 'Fill Form', icon: 'form-input', shortcut: 'F', group: 'form' },
  { mode: 'sign', label: 'Sign', icon: 'pen-line', shortcut: 'G', group: 'form' },
]

export const ZOOM_LEVELS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4]
export const DEFAULT_ZOOM = 1
export const MIN_ZOOM = 0.1
export const MAX_ZOOM = 5
