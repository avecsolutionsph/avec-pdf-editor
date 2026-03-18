import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import type { DetectedTextItem, DetectedFont } from './font-detection.service'
import { invalidateTextCache } from './font-detection.service'

export interface TextEdit {
  pageIndex: number
  original: DetectedTextItem
  newText: string
}

/**
 * Map a detected font family to the closest available pdf-lib StandardFont.
 * Used as a fallback when we can't embed a custom font.
 */
function toStandardFont(font: DetectedFont): StandardFonts {
  const { monospace, bold, italic } = font
  const lower = font.family.toLowerCase()

  if (monospace) return bold ? StandardFonts.CourierBold : italic ? StandardFonts.CourierOblique : StandardFonts.Courier
  if (/times|serif|roman|garamond|palatino|book antiqua|cambria/i.test(lower)) {
    if (bold && italic) return StandardFonts.TimesRomanBoldItalic
    if (bold) return StandardFonts.TimesRomanBold
    if (italic) return StandardFonts.TimesRomanItalic
    return StandardFonts.TimesRoman
  }
  if (bold && italic) return StandardFonts.HelveticaBoldOblique
  if (bold) return StandardFonts.HelveticaBold
  if (italic) return StandardFonts.HelveticaOblique
  return StandardFonts.Helvetica
}

/**
 * Apply a list of text edits to the PDF bytes.
 *
 * Strategy:
 * 1. Draw a white rectangle over the original text (whitebox)
 * 2. Draw the new text at the same position with matched font metrics
 *
 * This is the same approach Acrobat uses for most in-place text edits.
 * True content-stream surgery is saved for a future iteration.
 */
export async function applyTextEdits(
  bytes: Uint8Array,
  edits: TextEdit[]
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(bytes)
  pdfDoc.registerFontkit(fontkit)

  const pages = pdfDoc.getPages()

  for (const edit of edits) {
    if (!edit.newText && !edit.original.text) continue
    const page = pages[edit.pageIndex]
    if (!page) continue

    const { pdfRect, font } = edit.original

    // ── 1. Whitebox over original text ────────────────────────────────────
    // Add a small padding so we cover descenders/ascenders cleanly
    const pad = font.size * 0.15
    page.drawRectangle({
      x: pdfRect.x - pad,
      y: pdfRect.y - pad,
      width: pdfRect.width + pad * 2,
      height: pdfRect.height + pad * 2,
      color: rgb(1, 1, 1),
      borderWidth: 0,
    })

    // ── 2. Draw new text at original position ─────────────────────────────
    if (!edit.newText.trim()) continue

    const embeddedFont = await pdfDoc.embedFont(toStandardFont(font))

    // pdf-lib drawText y is baseline; pdfRect.y is bottom of glyph box
    const baseline = pdfRect.y + font.size * 0.2

    page.drawText(edit.newText, {
      x: pdfRect.x,
      y: baseline,
      size: font.size,
      font: embeddedFont,
      color: rgb(0, 0, 0),
      maxWidth: pdfRect.width * 2, // allow overflow for now
    })
  }

  invalidateTextCache()
  return pdfDoc.save()
}
