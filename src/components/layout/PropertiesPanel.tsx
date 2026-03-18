import { useAnnotationStore } from '../../store/annotation.store'
import { useToolStore } from '../../store/tool.store'
import type { ShapeKind } from '../../types/tool.types'

const PRESET_COLORS = [
  '#FFD600', '#FF4B4B', '#4B8EFF', '#34D399', '#F97316',
  '#A78BFA', '#000000', '#FFFFFF',
]

export function PropertiesPanel() {
  const { options, setColor, setOpacity, setStrokeWidth, setFontSize, setShapeKind, activeTool } = useToolStore()
  const { selectedId, annotations, removeAnnotation, selectAnnotation } = useAnnotationStore()
  const selectedAnnotation = annotations.find((a) => a.id === selectedId)

  const showStroke = activeTool === 'draw' || activeTool === 'shape'
  const showFont = activeTool === 'text-box'
  const showShape = activeTool === 'shape'
  const showOpacity = activeTool === 'highlight'

  const shapes: Array<{ kind: ShapeKind; label: string; icon: string }> = [
    { kind: 'rect', label: 'Rectangle', icon: '⬜' },
    { kind: 'ellipse', label: 'Ellipse', icon: '⭕' },
    { kind: 'arrow', label: 'Arrow', icon: '→' },
    { kind: 'line', label: 'Line', icon: '—' },
  ]

  return (
    <div className="w-52 border-l border-gray-200 bg-white flex flex-col overflow-y-auto shrink-0">
      <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-200">
        Properties
      </div>

      <div className="flex flex-col gap-4 p-3">
        {/* Color */}
        <div>
          <label className="text-xs font-medium text-gray-600 mb-2 block">Color</label>
          <div className="grid grid-cols-4 gap-1.5">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className="w-9 h-9 rounded-md border-2 transition-transform hover:scale-110"
                style={{
                  background: c,
                  borderColor: options.color === c ? '#3B82F6' : 'transparent',
                  boxShadow: c === '#FFFFFF' ? 'inset 0 0 0 1px #ddd' : undefined,
                }}
              />
            ))}
          </div>
          {/* Custom color */}
          <div className="flex items-center gap-2 mt-2">
            <input
              type="color"
              value={options.color}
              onChange={(e) => setColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer border border-gray-200"
            />
            <span className="text-xs text-gray-500 font-mono">{options.color}</span>
          </div>
        </div>

        {/* Opacity (for highlight) */}
        {showOpacity && (
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">
              Opacity <span className="text-gray-400">{Math.round(options.opacity * 100)}%</span>
            </label>
            <input
              type="range"
              min={0.1}
              max={1}
              step={0.05}
              value={options.opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              className="w-full accent-red-500"
            />
          </div>
        )}

        {/* Stroke width */}
        {showStroke && (
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">
              Stroke <span className="text-gray-400">{options.strokeWidth}px</span>
            </label>
            <input
              type="range"
              min={1}
              max={20}
              step={1}
              value={options.strokeWidth}
              onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
              className="w-full accent-red-500"
            />
          </div>
        )}

        {/* Shape selector */}
        {showShape && (
          <div>
            <label className="text-xs font-medium text-gray-600 mb-2 block">Shape</label>
            <div className="grid grid-cols-2 gap-1.5">
              {shapes.map((s) => (
                <button
                  key={s.kind}
                  onClick={() => setShapeKind(s.kind)}
                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-xs border transition-colors ${
                    options.shapeKind === s.kind
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  <span>{s.icon}</span>
                  <span>{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Font size (text box) */}
        {showFont && (
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">
              Font size <span className="text-gray-400">{options.fontSize}pt</span>
            </label>
            <input
              type="range"
              min={8}
              max={72}
              step={1}
              value={options.fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="w-full accent-red-500"
            />
          </div>
        )}

        {/* Selected annotation actions */}
        {selectedAnnotation && (
          <div className="mt-2 pt-3 border-t border-gray-100">
            <div className="text-xs text-gray-400 mb-2 capitalize">
              {selectedAnnotation.type.replace('-', ' ')} selected
            </div>
            <button
              onClick={() => {
                removeAnnotation(selectedAnnotation.id)
                selectAnnotation(null)
              }}
              className="w-full px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded hover:bg-red-50 transition-colors"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
