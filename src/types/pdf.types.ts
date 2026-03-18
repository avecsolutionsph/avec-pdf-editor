export interface FontInfo {
  name: string
  size: number
  color: string // hex
  weight: 'normal' | 'bold'
  isItalic: boolean
  isMonospace: boolean
  family: string
}

export interface TextSpan {
  text: string
  font: FontInfo
  bbox: BoundingBox // in PDF coordinate space
  pageIndex: number
}

export interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
}

export interface PdfPageInfo {
  index: number
  width: number  // in PDF units (pt)
  height: number
  rotation: number
}

export interface PdfDocument {
  fileName: string
  bytes: Uint8Array
  pageCount: number
  pages: PdfPageInfo[]
  isProtected: boolean
  isModified: boolean
}
