import { PDFDocument, PDFTextField, PDFCheckBox, PDFRadioGroup, PDFDropdown, PDFOptionList } from 'pdf-lib'

export type FieldType = 'text' | 'checkbox' | 'radio' | 'dropdown' | 'option-list' | 'unknown'

export interface FormField {
  name: string
  type: FieldType
  // Position in PDF coordinate space (bottom-left origin, points)
  rect: { x: number; y: number; width: number; height: number }
  pageIndex: number
  // Current value
  value: string | boolean | string[]
  // Options for dropdowns / radio groups
  options?: string[]
  // Whether field is read-only
  readOnly: boolean
}

export interface DetectedForm {
  fields: FormField[]
  hasFields: boolean
}

export async function detectFormFields(bytes: Uint8Array): Promise<DetectedForm> {
  try {
    const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true })
    const form = pdfDoc.getForm()
    const rawFields = form.getFields()

    if (!rawFields.length) return { fields: [], hasFields: false }

    const fields: FormField[] = []

    for (const field of rawFields) {
      const widgets = field.acroField.getWidgets()

      for (const widget of widgets) {
        const rect = widget.getRectangle()
        const pageRef = widget.P()
        const pageIndex = pageRef ? pdfDoc.getPages().findIndex(
          (p) => p.ref === pageRef
        ) : 0

        const base: Omit<FormField, 'type' | 'value' | 'options'> = {
          name: field.getName(),
          rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
          pageIndex: Math.max(0, pageIndex),
          readOnly: field.isReadOnly(),
        }

        if (field instanceof PDFTextField) {
          fields.push({ ...base, type: 'text', value: field.getText() ?? '' })
        } else if (field instanceof PDFCheckBox) {
          fields.push({ ...base, type: 'checkbox', value: field.isChecked() })
        } else if (field instanceof PDFRadioGroup) {
          fields.push({
            ...base,
            type: 'radio',
            value: field.getSelected() ?? '',
            options: field.getOptions(),
          })
        } else if (field instanceof PDFDropdown) {
          fields.push({
            ...base,
            type: 'dropdown',
            value: field.getSelected()?.[0] ?? '',
            options: field.getOptions(),
          })
        } else if (field instanceof PDFOptionList) {
          fields.push({
            ...base,
            type: 'option-list',
            value: field.getSelected() ?? [],
            options: field.getOptions(),
          })
        } else {
          fields.push({ ...base, type: 'unknown', value: '' })
        }
      }
    }

    return { fields, hasFields: fields.length > 0 }
  } catch {
    return { fields: [], hasFields: false }
  }
}

export async function writeFormValues(
  bytes: Uint8Array,
  values: Record<string, string | boolean | string[]>
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(bytes)
  const form = pdfDoc.getForm()

  for (const [name, value] of Object.entries(values)) {
    try {
      const field = form.getField(name)
      if (field instanceof PDFTextField) {
        field.setText(String(value))
      } else if (field instanceof PDFCheckBox) {
        value ? field.check() : field.uncheck()
      } else if (field instanceof PDFDropdown) {
        field.select(String(value))
      } else if (field instanceof PDFRadioGroup) {
        field.select(String(value))
      }
    } catch {
      // Field may not exist or be read-only — skip silently
    }
  }

  return pdfDoc.save()
}

export async function flattenForm(bytes: Uint8Array): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(bytes)
  const form = pdfDoc.getForm()
  form.flatten()
  return pdfDoc.save()
}
