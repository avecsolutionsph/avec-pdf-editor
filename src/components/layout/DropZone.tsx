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
      className={`flex flex-1 flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-200 outline-none ${
        isDragActive
          ? 'bg-red-50'
          : 'bg-gray-50 hover:bg-gray-100'
      }`}
    >
      <input {...getInputProps()} />
      <div
        className={`flex flex-col items-center gap-4 text-center p-10 rounded-2xl border-2 border-dashed transition-all duration-200 ${
          isDragActive
            ? 'border-red-400 bg-white shadow-xl scale-105'
            : 'border-gray-300 bg-white shadow-sm hover:border-red-300 hover:shadow-md'
        }`}
      >
        {/* Icon */}
        <div
          className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-200 ${
            isDragActive ? 'bg-red-100 scale-110' : 'bg-red-50'
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`w-10 h-10 transition-colors duration-200 ${
              isDragActive ? 'text-red-500' : 'text-red-400'
            }`}
          >
            {isDragActive ? (
              // Arrow-down icon when dragging
              <>
                <path d="M12 3v13" />
                <path d="m7 11 5 5 5-5" />
                <path d="M5 21h14" />
              </>
            ) : (
              // Document + upload icon at rest
              <>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <polyline points="9 15 12 12 15 15" />
              </>
            )}
          </svg>
        </div>

        {/* Text */}
        <div>
          <p
            className={`text-lg font-semibold transition-colors duration-200 ${
              isDragActive ? 'text-red-600' : 'text-gray-700'
            }`}
          >
            {isDragActive ? 'Release to open PDF' : 'Open a PDF to get started'}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {isDragActive
              ? 'Drop your file here'
              : 'Drag & drop a PDF, or click to browse'}
          </p>
        </div>

        {/* Button — only shown at rest */}
        {!isDragActive && (
          <button className="mt-1 px-5 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 active:bg-red-800 active:scale-95 transition-all shadow-sm">
            Choose file
          </button>
        )}

        {/* Drag hint pill at rest */}
        {!isDragActive && (
          <p className="text-xs text-gray-300 -mt-1">PDF files only</p>
        )}

        {/* "Ready to drop" pulse indicator during drag */}
        {isDragActive && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-full text-xs text-red-500 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            Ready to open
          </div>
        )}
      </div>
    </div>
  )
}
