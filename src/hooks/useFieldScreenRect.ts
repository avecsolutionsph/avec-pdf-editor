import { useDocumentStore } from '../store/document.store'
import { useUiStore } from '../store/ui.store'
import type { FormField } from '../services/form-fill.service'

/**
 * Converts a FormField's PDF rect (bottom-left origin, pts) to a CSS rect
 * (top-left origin, px) for positioning HTML overlay elements.
 */
export function useFieldScreenRect(field: FormField) {
  const { pages } = useDocumentStore()
  const { zoom } = useUiStore()
  const page = pages[field.pageIndex]
  if (!page) return null

  const pageHeight = page.height

  // PDF: y is distance from bottom; convert to distance from top
  const topFromBottom = field.rect.y
  const topFromTop = pageHeight - topFromBottom - field.rect.height

  return {
    left: field.rect.x * zoom,
    top: topFromTop * zoom,
    width: field.rect.width * zoom,
    height: field.rect.height * zoom,
  }
}
