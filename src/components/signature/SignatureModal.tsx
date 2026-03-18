import { useRef, useState, useCallback } from 'react'
import { useUiStore } from '../../store/ui.store'
import { useSignatureStore } from '../../store/signature.store'
import { useToolStore } from '../../store/tool.store'
import { SignaturePad, type SignaturePadHandle } from './SignaturePad'
import { nanoid } from '../annotations/nanoid'
import type { SignatureData, SignatureInputMode } from '../../types/signature.types'

const CURSIVE_FONTS = [
  { name: 'Dancing Script', css: "'Dancing Script', cursive" },
  { name: 'Pacifico', css: "'Pacifico', cursive" },
  { name: 'Satisfy', css: "'Satisfy', cursive" },
  { name: 'Great Vibes', css: "'Great Vibes', cursive" },
]

export function SignatureModal() {
  const { closeModal } = useUiStore()
  const { saveSignature, setPendingSignature } = useSignatureStore()
  const { setTool } = useToolStore()

  const [tab, setTab] = useState<SignatureInputMode>('draw')
  const [typedName, setTypedName] = useState('')
  const [selectedFont, setSelectedFont] = useState(CURSIVE_FONTS[0])
  const [penColor, setPenColor] = useState('#111111')
  const padRef = useRef<SignaturePadHandle>(null)

  const captureAndClose = useCallback(async (dataUrl: string) => {
    if (!dataUrl || dataUrl === 'data:,') return

    // Measure actual content dimensions from canvas
    const img = new Image()
    img.src = dataUrl
    await new Promise((r) => { img.onload = r })

    const sig: SignatureData = {
      id: nanoid(),
      dataUrl,
      width: img.naturalWidth,
      height: img.naturalHeight,
      createdAt: Date.now(),
    }

    saveSignature(sig)
    setPendingSignature(sig)
    setTool('sign')
    closeModal()
  }, [saveSignature, setPendingSignature, setTool, closeModal])

  const handleDrawConfirm = useCallback(() => {
    if (padRef.current?.isEmpty()) return
    captureAndClose(padRef.current?.toDataURL() ?? '')
  }, [captureAndClose])

  const handleTypeConfirm = useCallback(() => {
    if (!typedName.trim()) return

    // Render typed name to canvas using selected font
    const canvas = document.createElement('canvas')
    const fontSize = 60
    canvas.width = Math.max(typedName.length * fontSize * 0.7, 300)
    canvas.height = fontSize * 2
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.font = `${fontSize}px ${selectedFont.css}`
    ctx.fillStyle = penColor
    ctx.textBaseline = 'middle'
    ctx.fillText(typedName, 16, canvas.height / 2)

    captureAndClose(canvas.toDataURL('image/png'))
  }, [typedName, selectedFont, penColor, captureAndClose])

  const handleUpload = useCallback(async (file: File) => {
    const blob = file
    const url = URL.createObjectURL(blob)

    // Draw onto canvas to normalize format and get proper dimensions
    const img = new Image()
    img.src = url
    await new Promise((r) => { img.onload = r })
    const canvas = document.createElement('canvas')
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, 0, 0)
    URL.revokeObjectURL(url)

    captureAndClose(canvas.toDataURL('image/png'))
  }, [captureAndClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-[560px] max-w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">Add Signature</h2>
          <button
            onClick={closeModal}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 text-lg"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {(['draw', 'type', 'upload'] as SignatureInputMode[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 text-sm font-medium capitalize transition-colors ${
                tab === t
                  ? 'text-red-600 border-b-2 border-red-500 bg-red-50/30'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'draw' ? '✏️ Draw' : t === 'type' ? '⌨️ Type' : '📎 Upload'}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-6">
          {tab === 'draw' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-gray-500">Draw your signature below</p>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-400">Color</label>
                  <input
                    type="color"
                    value={penColor}
                    onChange={(e) => setPenColor(e.target.value)}
                    className="w-7 h-7 rounded cursor-pointer border border-gray-200"
                  />
                  <button
                    onClick={() => padRef.current?.clear()}
                    className="text-xs text-gray-400 hover:text-gray-600 underline"
                  >
                    Clear
                  </button>
                </div>
              </div>
              <div className="flex justify-center">
                <SignaturePad ref={padRef} width={480} height={180} penColor={penColor} />
              </div>
            </div>
          )}

          {tab === 'type' && (
            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Type your name…"
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400"
                autoFocus
              />
              {/* Font preview + selector */}
              <div className="grid grid-cols-2 gap-2">
                {CURSIVE_FONTS.map((font) => (
                  <button
                    key={font.name}
                    onClick={() => setSelectedFont(font)}
                    className={`p-3 border-2 rounded-lg text-left transition-colors ${
                      selectedFont.name === font.name
                        ? 'border-red-400 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span
                      style={{ fontFamily: font.css, fontSize: 26, color: penColor, lineHeight: 1.2 }}
                    >
                      {typedName || 'Preview'}
                    </span>
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-400">Ink color</label>
                <input
                  type="color"
                  value={penColor}
                  onChange={(e) => setPenColor(e.target.value)}
                  className="w-7 h-7 rounded cursor-pointer border border-gray-200"
                />
              </div>
            </div>
          )}

          {tab === 'upload' && (
            <label className="flex flex-col items-center justify-center gap-3 h-40 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-red-300 hover:bg-red-50/20 transition-colors">
              <div className="text-3xl">🖼️</div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">Click to upload an image</p>
                <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, or SVG</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/png,image/jpeg,image/gif,image/webp"
                onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
              />
            </label>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={closeModal}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={tab === 'draw' ? handleDrawConfirm : tab === 'type' ? handleTypeConfirm : undefined}
            disabled={tab === 'upload'}
            className="px-5 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-40 transition-colors"
          >
            Apply Signature
          </button>
        </div>
      </div>
    </div>
  )
}
