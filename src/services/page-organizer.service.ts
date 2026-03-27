import { PDFDocument } from 'pdf-lib'

/**
 * Reorder pages in a PDF document.
 * @param bytes - Original PDF bytes
 * @param newOrder - Array of original page indices in the desired new order
 * @returns New PDF bytes with pages in the given order
 */
export async function reorderPages(bytes: Uint8Array, newOrder: number[]): Promise<Uint8Array> {
  const srcDoc = await PDFDocument.load(bytes)
  const destDoc = await PDFDocument.create()

  const copiedPages = await destDoc.copyPages(srcDoc, newOrder)
  for (const page of copiedPages) {
    destDoc.addPage(page)
  }

  const result = await destDoc.save()
  return new Uint8Array(result)
}

/**
 * Delete a page from a PDF document.
 * @param bytes - Original PDF bytes
 * @param pageIndex - Zero-based index of the page to delete
 * @returns New PDF bytes with the page removed
 */
export async function deletePage(bytes: Uint8Array, pageIndex: number): Promise<Uint8Array> {
  const doc = await PDFDocument.load(bytes)
  doc.removePage(pageIndex)
  const result = await doc.save()
  return new Uint8Array(result)
}

/**
 * Duplicate a page in a PDF document, inserting the copy right after the original.
 * @param bytes - Original PDF bytes
 * @param pageIndex - Zero-based index of the page to duplicate
 * @returns New PDF bytes with the duplicate inserted after the original
 */
export async function duplicatePage(bytes: Uint8Array, pageIndex: number): Promise<Uint8Array> {
  const srcDoc = await PDFDocument.load(bytes)
  const destDoc = await PDFDocument.load(bytes)

  const [copiedPage] = await destDoc.copyPages(srcDoc, [pageIndex])
  // Insert after the original: pages are 0-indexed, inserting at pageIndex+1
  const totalPages = destDoc.getPageCount()
  const insertAt = pageIndex + 1

  if (insertAt >= totalPages) {
    destDoc.addPage(copiedPage)
  } else {
    destDoc.insertPage(insertAt, copiedPage)
  }

  const result = await destDoc.save()
  return new Uint8Array(result)
}
