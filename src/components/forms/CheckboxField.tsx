import type { FormField } from '../../services/form-fill.service'

interface Props {
  field: FormField
  checked: boolean
  onChange: (v: boolean) => void
  active: boolean
}

export function CheckboxField({ field, checked, onChange, active }: Props) {
  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{
        background: active ? 'rgba(59, 130, 246, 0.06)' : 'transparent',
        border: active ? '1.5px solid rgba(59, 130, 246, 0.5)' : '1px solid rgba(0,0,0,0.15)',
        borderRadius: 2,
        cursor: active ? 'pointer' : 'default',
      }}
      onClick={() => active && !field.readOnly && onChange(!checked)}
      title={field.name}
    >
      {checked && (
        <svg viewBox="0 0 12 12" className="w-3/4 h-3/4" fill="none" stroke="#111" strokeWidth={2}>
          <polyline points="2,6 5,9 10,3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  )
}
