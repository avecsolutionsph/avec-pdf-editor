import { useFormStore } from '../../store/form.store'
import { useToolStore } from '../../store/tool.store'
import { useFieldScreenRect } from '../../hooks/useFieldScreenRect'
import type { FormField } from '../../services/form-fill.service'
import { TextField } from './TextField'
import { CheckboxField } from './CheckboxField'
import { DropdownField } from './DropdownField'
import { RadioField } from './RadioField'

interface Props {
  pageIndex: number
}

export function FormFieldOverlay({ pageIndex }: Props) {
  const { fields } = useFormStore()
  const { activeTool } = useToolStore()

  // Only render when form-fill or sign tool is active, or always show fields
  const isFormMode = activeTool === 'form-fill' || activeTool === 'sign'

  const pageFields = fields.filter((f) => f.pageIndex === pageIndex)
  if (!pageFields.length) return null

  return (
    <div className="absolute inset-0 pointer-events-none">
      {pageFields.map((field) => (
        <FieldRenderer key={`${field.name}-${field.pageIndex}`} field={field} active={isFormMode} />
      ))}
    </div>
  )
}

function FieldRenderer({ field, active }: { field: FormField; active: boolean }) {
  const screenRect = useFieldScreenRect(field)
  if (!screenRect) return null

  const { setValue, values } = useFormStore()
  const value = values[field.name]

  const style: React.CSSProperties = {
    position: 'absolute',
    left: screenRect.left,
    top: screenRect.top,
    width: screenRect.width,
    height: screenRect.height,
    pointerEvents: active ? 'auto' : 'none',
  }

  switch (field.type) {
    case 'text':
      return (
        <div style={style}>
          <TextField
            field={field}
            value={String(value ?? '')}
            onChange={(v) => setValue(field.name, v)}
            active={active}
            height={screenRect.height}
          />
        </div>
      )
    case 'checkbox':
      return (
        <div style={style}>
          <CheckboxField
            field={field}
            checked={Boolean(value)}
            onChange={(v) => setValue(field.name, v)}
            active={active}
          />
        </div>
      )
    case 'radio':
      return (
        <div style={style}>
          <RadioField
            field={field}
            selected={String(value ?? '')}
            onChange={(v) => setValue(field.name, v)}
            active={active}
          />
        </div>
      )
    case 'dropdown':
      return (
        <div style={style}>
          <DropdownField
            field={field}
            value={String(value ?? '')}
            onChange={(v) => setValue(field.name, v)}
            active={active}
            height={screenRect.height}
          />
        </div>
      )
    default:
      return null
  }
}
