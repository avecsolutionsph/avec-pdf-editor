import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { ZoomControls } from './ZoomControls'
import { PageNavigation } from './PageNavigation'
import { FontMatchIndicator } from '../text-edit/FontMatchIndicator'
import { useDocumentStore } from '../../store/document.store'
import { useUiStore } from '../../store/ui.store'
import { useHistoryStore } from '../../store/history.store'
import { useFormStore } from '../../store/form.store'
import { loadPdfDocument } from '../../services/pdf-renderer.service'
import { readFileAsBytes, downloadBytes, isPdf } from '../../lib/file-utils'
import { writeFormValues } from '../../services/form-fill.service'
import type { DetectedFont } from '../../services/font-detection.service'

interface Props {
  activeFont?: DetectedFont | null
}

/** Thin vertical rule used to separate toolbar groups */
function Divider() {
  return <div className="w-px h-5 bg-gray-200 mx-1 shrink-0" aria-hidden="true" />
}

export function Toolbar({ activeFont }: Props) {
  const { fileName, bytes, isModified, setDocument } = useDocumentStore()
  const { canUndo, canRedo, undo, redo } = useHistoryStore()
  const { toggleSidebar, openModal } = useUiStore()
  const { values: formValues, isDirty: formDirty } = useFormStore()

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
    let finalBytes = bytes

    // Bake in any form values before saving
    if (formDirty) {
      finalBytes = await writeFormValues(bytes, formValues)
    }

    downloadBytes(finalBytes, fileName ?? 'document.pdf')
  }, [bytes, fileName, formValues, formDirty])

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

  const dirty = isModified || formDirty
  const undoEnabled = canUndo()
  const redoEnabled = canRedo()

  return (
    <div
      {...getRootProps()}
      className="h-12 flex items-center gap-1 px-3 border-b border-gray-200 bg-white shrink-0 z-10 select-none"
    >
      <input {...getInputProps()} />

      {/* Logo */}
      <div className="flex items-center gap-2 mr-1">
        <div className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center shadow-sm">
          <span className="text-white text-xs font-bold tracking-tight">PDF</span>
        </div>
        <span className="text-sm font-semibold text-gray-800 hidden sm:block">Editor</span>
      </div>

      <Divider />

      {/* Sidebar toggle */}
      <button
        onClick={toggleSidebar}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-700 active:bg-gray-200"
        title="Toggle sidebar"
        aria-label="Toggle sidebar"
      >
        ☰
      </button>

      <Divider />

      {/* File ops group */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={open}
          className="px-3 py-1.5 text-xs font-medium rounded-lg text-gray-700 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200"
        >
          Open
        </button>
        <button
          onClick={handleSave}
          disabled={!bytes}
          className="px-3 py-1.5 text-xs font-medium rounded-lg text-gray-700 flex items-center gap-1.5 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        >
          Save
          {dirty && (
            <span
              className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block"
              title="Unsaved changes"
            />
          )}
        </button>
      </div>

      <Divider />

      {/* Undo / Redo group */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={handleUndo}
          disabled={!undoEnabled}
          className={[
            'w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors duration-150',
            undoEnabled
              ? 'text-gray-600 hover:bg-gray-100 hover:text-gray-800 active:bg-gray-200 cursor-pointer'
              : 'text-gray-300 cursor-not-allowed',
          ].join(' ')}
          title="Undo (⌘Z)"
          aria-label="Undo"
        >
          ↩
        </button>
        <button
          onClick={handleRedo}
          disabled={!redoEnabled}
          className={[
            'w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors duration-150',
            redoEnabled
              ? 'text-gray-600 hover:bg-gray-100 hover:text-gray-800 active:bg-gray-200 cursor-pointer'
              : 'text-gray-300 cursor-not-allowed',
          ].join(' ')}
          title="Redo (⌘⇧Z)"
          aria-label="Redo"
        >
          ↪
        </button>
      </div>

      <Divider />

      {/* Zoom */}
      <ZoomControls />

      {/* Page navigation — visible when a document is loaded */}
      {bytes && (
        <>
          <Divider />
          <PageNavigation />
        </>
      )}

      {/* Font match indicator — visible only while editing text */}
      {activeFont && <FontMatchIndicator font={activeFont} />}

      {/* Right-side actions */}
      {bytes && (
        <>
          <div className="w-px h-5 bg-gray-200 mx-1 ml-auto shrink-0" aria-hidden="true" />
          <button
            onClick={() => openModal('signature')}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-700 flex items-center gap-1.5 transition-colors duration-150 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 active:bg-gray-100"
            title="Add signature"
          >
            🖋 Sign
          </button>
        </>
      )}

      {/* File name */}
      {fileName && !bytes && (
        <span className="ml-auto text-xs text-gray-400 truncate max-w-48">
          {fileName}
        </span>
      )}
      {fileName && bytes && (
        <span className="text-xs text-gray-400 truncate max-w-32">
          {fileName}
        </span>
      )}
    </div>
  )
}
