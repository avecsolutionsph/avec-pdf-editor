import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { ZoomControls } from './ZoomControls'
import { useDocumentStore } from '../../store/document.store'
import { useUiStore } from '../../store/ui.store'
import { useHistoryStore } from '../../store/history.store'
import { loadPdfDocument } from '../../services/pdf-renderer.service'
import { readFileAsBytes, downloadBytes, isPdf } from '../../lib/file-utils'

export function Toolbar() {
  const { fileName, bytes, isModified, setDocument } = useDocumentStore()
  const { canUndo, canRedo, undo, redo } = useHistoryStore()
  const { toggleSidebar } = useUiStore()

  const openFile = useCallback(async (file: File) => {
    if (!isPdf(file)) return
    const fileBytes = await readFileAsBytes(file)
    const { pages } = await loadPdfDocument(fileBytes)
    setDocument(file.name, fileBytes, pages)
    useHistoryStore.getState().clearHistory()
    useHistoryStore.getState().pushSnapshot(fileBytes)
  }, [])

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop: (files) => files[0] && openFile(files[0]),
    accept: { 'application/pdf': ['.pdf'] },
    noClick: true,
    noKeyboard: true,
  })

  const handleSave = useCallback(async () => {
    if (!bytes) return
    const fileName_ = fileName ?? 'document.pdf'
    downloadBytes(bytes, fileName_)
  }, [bytes, fileName])

  const handleUndo = useCallback(() => {
    const prev = undo()
    if (!prev) return
    loadPdfDocument(prev).then(({ pages }) => {
      useDocumentStore.getState().setDocument(fileName ?? 'document.pdf', prev, pages)
    })
  }, [undo, fileName])

  const handleRedo = useCallback(() => {
    const next = redo()
    if (!next) return
    loadPdfDocument(next).then(({ pages }) => {
      useDocumentStore.getState().setDocument(fileName ?? 'document.pdf', next, pages)
    })
  }, [redo, fileName])

  return (
    <div
      {...getRootProps()}
      className="h-12 flex items-center gap-2 px-3 border-b border-gray-200 bg-white shrink-0 z-10"
    >
      <input {...getInputProps()} />

      {/* Logo / App name */}
      <div className="flex items-center gap-2 mr-2">
        <div className="w-7 h-7 bg-red-600 rounded flex items-center justify-center">
          <span className="text-white text-xs font-bold">PDF</span>
        </div>
        <span className="text-sm font-semibold text-gray-800 hidden sm:block">Editor</span>
      </div>

      <div className="w-px h-6 bg-gray-200" />

      {/* Sidebar toggle */}
      <button
        onClick={toggleSidebar}
        className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500"
        title="Toggle sidebar"
      >
        ☰
      </button>

      {/* File ops */}
      <button
        onClick={open}
        className="px-3 py-1.5 text-xs font-medium rounded hover:bg-gray-100 text-gray-700"
      >
        Open
      </button>
      <button
        onClick={handleSave}
        disabled={!bytes}
        className="px-3 py-1.5 text-xs font-medium rounded hover:bg-gray-100 text-gray-700 disabled:opacity-40"
      >
        Save
        {isModified && <span className="ml-1 text-red-500">•</span>}
      </button>

      <div className="w-px h-6 bg-gray-200" />

      {/* Undo / Redo */}
      <button
        onClick={handleUndo}
        disabled={!canUndo()}
        className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500 disabled:opacity-30 text-sm"
        title="Undo (⌘Z)"
      >
        ↩
      </button>
      <button
        onClick={handleRedo}
        disabled={!canRedo()}
        className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500 disabled:opacity-30 text-sm"
        title="Redo (⌘⇧Z)"
      >
        ↪
      </button>

      <div className="w-px h-6 bg-gray-200" />

      {/* Zoom */}
      <ZoomControls />

      {/* File name */}
      {fileName && (
        <span className="ml-auto text-xs text-gray-400 truncate max-w-48">
          {fileName}
        </span>
      )}
    </div>
  )
}
