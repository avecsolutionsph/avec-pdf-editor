import type { FormField } from '../../services/form-fill.service'

interface Props {
  field: FormField
  value: string
  onChange: (v: string) => void
  active: boolean
  height: number
}

export function DropdownField({ field, value, onChange, active, height }: Props) {
  const fontSize = Math.min(Math.max(height * 0.55, 8), 14)

  return (
    <select
      value={value}
      onChange={(e) => active && onChange(e.target.value)}
      disabled={!active || field.readOnly}
      style={{
        width: '100%',
        height: '100%',
        fontSize,
        fontFamily: 'Helvetica, Arial, sans-serif',
        background: active ? 'rgba(59, 130, 246, 0.06)' : 'transparent',
        border: active ? '1.5px solid rgba(59, 130, 246, 0.5)' : '1px solid rgba(0,0,0,0.15)',
        borderRadius: 2,
        outline: 'none',
        cursor: active ? 'pointer' : 'default',
        color: '#111',
        padding: '0 2px',
        boxSizing: 'border-box',
      }}
      title={field.name}
    >
      <option value="">—</option>
      {(field.options ?? []).map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  )
}
