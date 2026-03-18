/**
 * PDF coordinate space: bottom-left origin, Y increases upward.
 * Screen/canvas coordinate space: top-left origin, Y increases downward.
 *
 * This module is the single source of truth for all coordinate transforms.
 */

export interface ScreenPoint {
  x: number
  y: number
}

export interface PdfPoint {
  x: number
  y: number
}

export interface ScreenRect {
  x: number
  y: number
  width: number
  height: number
}

export interface PdfRect {
  x: number      // left
  y: number      // bottom (PDF space)
  width: number
  height: number
}

/**
 * Convert PDF coordinates to screen (canvas) coordinates.
 * @param pdfPoint  Point in PDF user space
 * @param pageHeight  Height of the page in PDF units (pt)
 * @param scale  Render scale factor
 */
export function pdfToScreen(pdfPoint: PdfPoint, pageHeight: number, scale: number): ScreenPoint {
  return {
    x: pdfPoint.x * scale,
    y: (pageHeight - pdfPoint.y) * scale,
  }
}

/**
 * Convert screen (canvas) coordinates to PDF coordinates.
 */
export function screenToPdf(screenPoint: ScreenPoint, pageHeight: number, scale: number): PdfPoint {
  return {
    x: screenPoint.x / scale,
    y: pageHeight - screenPoint.y / scale,
  }
}

/**
 * Convert a PDF rect [x, y, width, height] (bottom-left origin) to screen rect.
 */
export function pdfRectToScreen(rect: PdfRect, pageHeight: number, scale: number): ScreenRect {
  const topLeft = pdfToScreen({ x: rect.x, y: rect.y + rect.height }, pageHeight, scale)
  return {
    x: topLeft.x,
    y: topLeft.y,
    width: rect.width * scale,
    height: rect.height * scale,
  }
}

/**
 * Convert a screen rect to a PDF rect.
 */
export function screenRectToPdf(rect: ScreenRect, pageHeight: number, scale: number): PdfRect {
  const bottomLeft = screenToPdf({ x: rect.x, y: rect.y + rect.height }, pageHeight, scale)
  return {
    x: bottomLeft.x,
    y: bottomLeft.y,
    width: rect.width / scale,
    height: rect.height / scale,
  }
}

/**
 * Convert a PDF.js viewport transform to a CSS transform string.
 */
export function viewportToTransform(transform: number[]): string {
  return `matrix(${transform.join(',')})`
}
