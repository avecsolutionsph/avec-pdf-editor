import { useRef } from 'react'
import type { FormField } from '../../services/form-fill.service'

interface Props {
  field: FormField
  value: string
  onChange: (v: string) => void
  active: boolean
  height: number
}

export function TextField({ field, value, onChange, active, height }: Props) {
  const ref = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  // Auto-size font to fit the field height (seamless fill — text fills the box naturally)
  const fontSize = Math.min(Math.max(height * 0.55, 8), 16)
  const isMultiline = height > 40

  const baseStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    padding: '1px 3px',
    fontSize,
    fontFamily: 'Helvetica, Arial, sans-serif',
    background: active ? 'rgba(59, 130, 246, 0.06)' : 'transparent',
    border: active ? '1.5px solid rgba(59, 130, 246, 0.5)' : '1px solid rgba(0,0,0,0.15)',
    borderRadius: 2,
    outline: 'none',
    resize: 'none',
    boxSizing: 'border-box',
    cursor: active ? 'text' : 'default',
    color: '#111',
    lineHeight: 1.2,
  }

  if (isMultiline) {
    return (
      <textarea
        ref={ref as React.Ref<HTMLTextAreaElement>}
        value={value}
        onChange={(e) => active && onChange(e.target.value)}
        readOnly={!active || field.readOnly}
        style={baseStyle}
        title={field.name}
      />
    )
  }

  return (
    <input
      ref={ref as React.Ref<HTMLInputElement>}
      type="text"
      value={value}
      onChange={(e) => active && onChange(e.target.value)}
      readOnly={!active || field.readOnly}
      style={baseStyle}
      title={field.name}
    />
  )
}
