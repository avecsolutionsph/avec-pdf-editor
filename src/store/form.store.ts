import { create } from 'zustand'
import type { FormField } from '../services/form-fill.service'

interface FormState {
  fields: FormField[]
  values: Record<string, string | boolean | string[]>
  isDirty: boolean

  setFields: (fields: FormField[]) => void
  setValue: (name: string, value: string | boolean | string[]) => void
  clearForm: () => void
}

export const useFormStore = create<FormState>()((set) => ({
  fields: [],
  values: {},
  isDirty: false,

  setFields: (fields) => {
    // Seed values from detected field state
    const values: Record<string, string | boolean | string[]> = {}
    for (const f of fields) values[f.name] = f.value
    set({ fields, values, isDirty: false })
  },

  setValue: (name, value) =>
    set((s) => ({ values: { ...s.values, [name]: value }, isDirty: true })),

  clearForm: () => set({ fields: [], values: {}, isDirty: false }),
}))
