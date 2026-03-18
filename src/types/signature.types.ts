export type SignatureInputMode = 'draw' | 'type' | 'upload'

export interface SignatureData {
  id: string
  dataUrl: string // PNG data URL
  width: number
  height: number
  createdAt: number
}

export interface SignaturePlacement {
  signatureId: string
  pageIndex: number
  x: number
  y: number
  width: number
  height: number
}
