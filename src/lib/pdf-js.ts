import * as pdfjsLib from 'pdfjs-dist'

// Point to the copied worker file in /public
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

export { pdfjsLib }

export type PdfjsDocument = pdfjsLib.PDFDocumentProxy
export type PdfjsPage = pdfjsLib.PDFPageProxy
