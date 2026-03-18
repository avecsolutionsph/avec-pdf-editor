import type { FormField } from '../../services/form-fill.service'

interface Props {
  field: FormField
  selected: string
  onChange: (v: string) => void
  active: boolean
}

export function RadioField({ field, selected, onChange, active }: Props) {
  const options = field.options ?? []

  // If only one option widget at this rect, show as a single radio button
  const value = options[0] ?? 'On'

  return (
    <div
      className="w-full h-full flex items-center justify-center rounded-full"
      style={{
        background: active ? 'rgba(59, 130, 246, 0.06)' : 'transparent',
        border: active ? '1.5px solid rgba(59, 130, 246, 0.5)' : '1px solid rgba(0,0,0,0.2)',
        borderRadius: '50%',
        cursor: active ? 'pointer' : 'default',
      }}
      onClick={() => active && !field.readOnly && onChange(selected === value ? '' : value)}
      title={field.name}
    >
      {selected === value && (
        <div className="w-1/2 h-1/2 bg-gray-800 rounded-full" />
      )}
    </div>
  )
}
