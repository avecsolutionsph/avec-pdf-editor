export type ToolMode =
  | 'select'
  | 'hand'
  | 'text-edit'
  | 'highlight'
  | 'sticky-note'
  | 'draw'
  | 'shape'
  | 'text-box'
  | 'form-fill'
  | 'sign'
  | 'redact'

export type ShapeKind = 'rect' | 'ellipse' | 'arrow' | 'line'

export interface ToolOptions {
  color: string
  opacity: number
  strokeWidth: number
  fontSize: number
  fontFamily: string
  shapeKind: ShapeKind
}
