import { useEffect } from 'react'
import { useDocumentStore } from '../store/document.store'
import { useFormStore } from '../store/form.store'
import { detectFormFields } from '../services/form-fill.service'

export function useFormFields() {
  const { bytes } = useDocumentStore()
  const { setFields, clearForm } = useFormStore()

  useEffect(() => {
    if (!bytes) {
      clearForm()
      return
    }
    detectFormFields(bytes).then(({ fields }) => setFields(fields))
  }, [bytes])
}
