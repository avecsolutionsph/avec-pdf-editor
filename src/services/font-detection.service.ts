import { getTextContent, getPage } from './pdf-renderer.service'

export interface DetectedTextItem {
  text: string
  // Screen-space bounding box (top-left origin, scaled)
  screenRect: { x: number; y: number; width: number; height: number }
  // PDF-space position (bottom-left origin, unscaled)
  pdfRect: { x: number; y: number; width: number; height: number }
  font: DetectedFont
  pageIndex: number
}

export interface DetectedFont {
  /** Raw PDF font name, e.g. "AAAAAB+Helvetica-Bold" */
  rawName: string
  /** Cleaned family name for CSS, e.g. "Helvetica" */
  family: string
  /** Approximate pt size derived from transform matrix */
  size: number
  /** Bold detected from font name */
  bold: boolean
  /** Italic detected from font name */
  italic: boolean
  /** Monospace detected from font name */
  monospace: boolean
  /** Approximate color (PDF.js doesn't expose fill color here — default black) */
  color: string
  /** CSS font-family string ready to use */
  cssFamily: string
}

// Cache per page so we don't re-fetch on every click
const textContentCache = new Map<string, DetectedTextItem[]>()

function cacheKey(pageIndex: number) {
  return `page-${pageIndex}`
}

export function invalidateTextCache() {
  textContentCache.clear()
}

/**
 * Returns all text items on a page with font info and screen-space rects.
 */
export async function getPageTextItems(
  pageIndex: number,
  scale: number,
  pageHeight: number
): Promise<DetectedTextItem[]> {
  const key = cacheKey(pageIndex)
  if (textContentCache.has(key)) {
    // Re-scale cached items if zoom changed
    return scaleItems(textContentCache.get(key)!, scale, pageHeight)
  }

  const content = await getTextContent(pageIndex)
  if (!content) return []

  const page = await getPage(pageIndex)
  if (!page) return []

  const viewport = page.getViewport({ scale: 1 })
  page.cleanup()

  const items: DetectedTextItem[] = []

  for (const item of content.items) {
    if (!('str' in item) || !item.str.trim()) continue

    const [a, b, , , tx, ty] = item.transform as number[]

    // Font size = magnitude of the font matrix vector
    const rawSize = Math.sqrt(a * a + b * b)
    if (rawSize < 1) continue

    // PDF text origin is bottom-left; width from item
    const pdfX = tx
    const pdfY = ty
    const pdfW = item.width || rawSize * item.str.length * 0.5
    const pdfH = rawSize * 1.2

    items.push({
      text: item.str,
      pdfRect: { x: pdfX, y: pdfY, width: pdfW, height: pdfH },
      screenRect: pdfToScreenRect(pdfX, pdfY, pdfW, pdfH, viewport.height, 1),
      font: parseFont(item.fontName as string, rawSize),
      pageIndex,
    })
  }

  textContentCache.set(key, items)
  return scaleItems(items, scale, viewport.height)
}

function scaleItems(items: DetectedTextItem[], scale: number, pageHeight: number): DetectedTextItem[] {
  return items.map((item) => ({
    ...item,
    screenRect: pdfToScreenRect(
      item.pdfRect.x,
      item.pdfRect.y,
      item.pdfRect.width,
      item.pdfRect.height,
      pageHeight,
      scale
    ),
  }))
}

function pdfToScreenRect(
  x: number,
  y: number,
  w: number,
  h: number,
  pageHeight: number,
  scale: number
) {
  // PDF: y from bottom. Screen: y from top.
  return {
    x: x * scale,
    y: (pageHeight - y - h) * scale,
    width: w * scale,
    height: h * scale,
  }
}

/**
 * Find the text item closest to a given screen-space click point.
 */
export function hitTestTextItem(
  items: DetectedTextItem[],
  clickX: number,
  clickY: number,
  tolerance = 6
): DetectedTextItem | null {
  // First: exact hit
  for (const item of items) {
    const { x, y, width, height } = item.screenRect
    if (clickX >= x - tolerance && clickX <= x + width + tolerance &&
        clickY >= y - tolerance && clickY <= y + height + tolerance) {
      return item
    }
  }

  // Fallback: nearest item within a generous radius
  let nearest: DetectedTextItem | null = null
  let nearestDist = Infinity
  for (const item of items) {
    const cx = item.screenRect.x + item.screenRect.width / 2
    const cy = item.screenRect.y + item.screenRect.height / 2
    const dist = Math.hypot(clickX - cx, clickY - cy)
    if (dist < nearestDist && dist < 40) {
      nearest = item
      nearestDist = dist
    }
  }
  return nearest
}

// ─── Font name parser ────────────────────────────────────────────────────────

const FONT_FAMILY_MAP: Record<string, string> = {
  helvetica: 'Helvetica, Arial, sans-serif',
  arial: 'Arial, Helvetica, sans-serif',
  times: 'Times New Roman, Times, serif',
  'times new roman': 'Times New Roman, Times, serif',
  courier: 'Courier New, Courier, monospace',
  'courier new': 'Courier New, Courier, monospace',
  georgia: 'Georgia, serif',
  verdana: 'Verdana, Geneva, sans-serif',
  tahoma: 'Tahoma, Geneva, sans-serif',
  trebuchet: 'Trebuchet MS, sans-serif',
  'comic sans': 'Comic Sans MS, cursive',
  impact: 'Impact, Charcoal, sans-serif',
  palatino: 'Palatino Linotype, Book Antiqua, Palatino, serif',
  garamond: 'Garamond, serif',
  'book antiqua': 'Book Antiqua, Palatino, serif',
  futura: 'Futura, Century Gothic, sans-serif',
  'century gothic': 'Century Gothic, Century, sans-serif',
  calibri: 'Calibri, Candara, Segoe, sans-serif',
  cambria: 'Cambria, Cochin, Georgia, serif',
  consolas: 'Consolas, Courier New, monospace',
  'gill sans': 'Gill Sans, Gill Sans MT, sans-serif',
  optima: 'Optima, Segoe, Candara, sans-serif',
  'open sans': '"Open Sans", sans-serif',
  roboto: 'Roboto, sans-serif',
  lato: 'Lato, sans-serif',
  montserrat: 'Montserrat, sans-serif',
  'source sans': '"Source Sans Pro", sans-serif',
  nunito: 'Nunito, sans-serif',
}

function parseFont(rawName: string, size: number): DetectedFont {
  // Strip subset prefix like "AAAAAB+"
  const cleaned = rawName.replace(/^[A-Z]{6}\+/, '')
  const lower = cleaned.toLowerCase()

  const bold = /bold|black|heavy|semibold|demi/i.test(cleaned)
  const italic = /italic|oblique|slant/i.test(cleaned)
  const monospace = /courier|mono|code|consolas|inconsolata|fira|source code/i.test(cleaned)

  // Find best CSS family match
  let cssFamily = ''
  let family = cleaned

  // Try exact / substring match in our map
  for (const [key, css] of Object.entries(FONT_FAMILY_MAP)) {
    if (lower.includes(key)) {
      cssFamily = css
      // Extract clean family name (first token before comma)
      family = css.split(',')[0].replace(/"/g, '').trim()
      break
    }
  }

  // Fallback by category
  if (!cssFamily) {
    if (monospace) cssFamily = 'Courier New, Courier, monospace'
    else if (/serif/i.test(cleaned)) cssFamily = 'Times New Roman, Times, serif'
    else cssFamily = 'Helvetica, Arial, sans-serif'
    family = cssFamily.split(',')[0].replace(/"/g, '').trim()
  }

  // Apply bold/italic to CSS string
  if (bold && !cssFamily.toLowerCase().includes('bold')) {
    // Will be handled via fontWeight in CSS
  }

  return { rawName, family, size, bold, italic, monospace, color: '#000000', cssFamily }
}
