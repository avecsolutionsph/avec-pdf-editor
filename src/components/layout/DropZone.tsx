import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { loadPdfDocument } from '../../services/pdf-renderer.service'
import { readFileAsBytes, isPdf } from '../../lib/file-utils'
import { useDocumentStore } from '../../store/document.store'
import { useHistoryStore } from '../../store/history.store'

export function DropZone() {
  const { setDocument } = useDocumentStore()

  const onDrop = useCallback(async (files: File[]) => {
    const file = files[0]
    if (!file || !isPdf(file)) return
    const bytes = await readFileAsBytes(file)
    const { pages } = await loadPdfDocument(bytes)
    setDocument(file.name, bytes, pages)
    useHistoryStore.getState().clearHistory()
    useHistoryStore.getState().pushSnapshot(bytes)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
  })

  return (
    <div
      {...getRootProps()}
      className={`flex flex-1 flex-col items-center justify-center gap-4 cursor-pointer transition-colors ${
        isDragActive ? 'bg-red-50 border-2 border-dashed border-red-400' : 'bg-gray-100'
      }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-3 text-center p-8">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-3xl">
          📄
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-700">
            {isDragActive ? 'Drop your PDF here' : 'Open a PDF to get started'}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Drag & drop or click to browse
          </p>
        </div>
        <button className="mt-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors">
          Choose file
        </button>
      </div>
    </div>
  )
}
