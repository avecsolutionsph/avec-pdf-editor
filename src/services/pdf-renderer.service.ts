import { pdfjsLib } from '../lib/pdf-js'
import type { PdfjsDocument, PdfjsPage } from '../lib/pdf-js'
import type { PdfPageInfo } from '../types/pdf.types'

let currentDoc: PdfjsDocument | null = null

export async function loadPdfDocument(bytes: Uint8Array): Promise<{
  doc: PdfjsDocument
  pages: PdfPageInfo[]
}> {
  if (currentDoc) {
    currentDoc.destroy()
    currentDoc = null
  }

  const doc = await pdfjsLib.getDocument({ data: bytes }).promise
  currentDoc = doc

  const pages: PdfPageInfo[] = []
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const viewport = page.getViewport({ scale: 1 })
    pages.push({
      index: i - 1,
      width: viewport.width,
      height: viewport.height,
      rotation: page.rotate,
    })
    page.cleanup()
  }

  return { doc, pages }
}

export async function getPage(pageIndex: number): Promise<PdfjsPage | null> {
  if (!currentDoc) return null
  return currentDoc.getPage(pageIndex + 1)
}

export async function renderPage(
  pageIndex: number,
  canvas: HTMLCanvasElement,
  scale: number
): Promise<void> {
  const page = await getPage(pageIndex)
  if (!page) return

  const viewport = page.getViewport({ scale })
  canvas.width = viewport.width
  canvas.height = viewport.height

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  await page.render({ canvasContext: ctx, viewport, canvas }).promise
  page.cleanup()
}

export async function renderPageThumbnail(
  pageIndex: number,
  targetWidth: number
): Promise<string> {
  const page = await getPage(pageIndex)
  if (!page) return ''

  const viewport = page.getViewport({ scale: 1 })
  const scale = targetWidth / viewport.width
  const scaledViewport = page.getViewport({ scale })

  const canvas = document.createElement('canvas')
  canvas.width = scaledViewport.width
  canvas.height = scaledViewport.height

  const ctx = canvas.getContext('2d')
  if (!ctx) return ''

  await page.render({ canvasContext: ctx, viewport: scaledViewport, canvas }).promise
  page.cleanup()

  return canvas.toDataURL('image/jpeg', 0.7)
}

export async function getTextContent(pageIndex: number) {
  const page = await getPage(pageIndex)
  if (!page) return null
  const content = await page.getTextContent()
  page.cleanup()
  return content
}

export function getCurrentDoc(): PdfjsDocument | null {
  return currentDoc
}
