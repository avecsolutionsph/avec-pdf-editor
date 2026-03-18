export type AnnotationType =
  | 'highlight'
  | 'sticky-note'
  | 'freehand'
  | 'shape'
  | 'text-box'

export interface BaseAnnotation {
  id: string
  type: AnnotationType
  pageIndex: number
  color: string
  opacity: number
  createdAt: number
}

export interface HighlightAnnotation extends BaseAnnotation {
  type: 'highlight'
  rects: Array<{ x: number; y: number; width: number; height: number }>
}

export interface StickyNoteAnnotation extends BaseAnnotation {
  type: 'sticky-note'
  x: number
  y: number
  content: string
}

export interface FreehandAnnotation extends BaseAnnotation {
  type: 'freehand'
  points: number[]
  strokeWidth: number
}

export type ShapeKind = 'rect' | 'ellipse' | 'arrow' | 'line'

export interface ShapeAnnotation extends BaseAnnotation {
  type: 'shape'
  shape: ShapeKind
  x: number
  y: number
  width: number
  height: number
  strokeWidth: number
  fill: string
}

export interface TextBoxAnnotation extends BaseAnnotation {
  type: 'text-box'
  x: number
  y: number
  width: number
  content: string
  fontSize: number
  fontFamily: string
}

export type Annotation =
  | HighlightAnnotation
  | StickyNoteAnnotation
  | FreehandAnnotation
  | ShapeAnnotation
  | TextBoxAnnotation
