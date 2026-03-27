import type { ReactElement } from 'react'
import { useAnnotationStore } from '../../store/annotation.store'
import { useToolStore } from '../../store/tool.store'
import type { ShapeKind } from '../../types/tool.types'

const PRESET_COLORS = [
  '#000000', '#FFFFFF', '#F87171', '#FB923C',
  '#FBBF24', '#4ADE80', '#60A5FA', '#A78BFA',
  '#F472B6', '#6B7280', '#1D4ED8', '#065F46',
]

// Bright colors that need a dark checkmark to stay visible
const LIGHT_COLORS = new Set(['#FFFFFF', '#FBBF24', '#4ADE80', '#60A5FA', '#F472B6', '#A78BFA', '#FB923C', '#F87171'])

// Thin SVG icons for shape buttons
const ShapeIcons: Record<ShapeKind, ReactElement> = {
  rect: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="2" width="12" height="12" rx="1" />
    </svg>
  ),
  ellipse: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <ellipse cx="8" cy="8" rx="6" ry="6" />
    </svg>
  ),
  arrow: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="2" y1="14" x2="14" y2="2" />
      <polyline points="7,2 14,2 14,9" />
    </svg>
  ),
  line: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <line x1="2" y1="14" x2="14" y2="2" />
    </svg>
  ),
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 select-none">
      {children}
    </div>
  )
}

// Styled range slider — uses CSS custom properties on the element so each
// instance can carry its own accent color without injecting duplicate <style> tags.
function StyledSlider({
  min,
  max,
  step,
  value,
  onChange,
  label,
  accentColor = '#EF4444',
}: {
  min: number
  max: number
  step: number
  value: number
  onChange: (v: number) => void
  label: string
  accentColor?: string
}) {
  const pct = ((value - min) / (max - min)) * 100

  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      aria-label={label}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="properties-slider w-full cursor-pointer outline-none"
      style={{
        // CSS custom properties read by the global stylesheet rule
        ['--slider-pct' as string]: `${pct}%`,
        ['--slider-accent' as string]: accentColor,
      }}
    />
  )
}

export function PropertiesPanel() {
  const { options, setColor, setOpacity, setStrokeWidth, setFontSize, setShapeKind, activeTool } = useToolStore()
  const { selectedId, annotations, removeAnnotation, selectAnnotation } = useAnnotationStore()
  const selectedAnnotation = annotations.find((a) => a.id === selectedId)

  const showStroke = activeTool === 'draw' || activeTool === 'shape'
  const showFont = activeTool === 'text-box'
  const showShape = activeTool === 'shape'
  const showOpacity = activeTool === 'highlight'

  const shapes: Array<{ kind: ShapeKind; label: string }> = [
    { kind: 'rect', label: 'Rectangle' },
    { kind: 'ellipse', label: 'Ellipse' },
    { kind: 'arrow', label: 'Arrow' },
    { kind: 'line', label: 'Line' },
  ]

  // Determine if we have any tool-specific sections to show
  const hasToolOptions = showStroke || showFont || showShape || showOpacity

  return (
    <div className="w-60 border-l border-gray-200 bg-gray-50 flex flex-col overflow-y-auto shrink-0 text-gray-800">
      {/* Panel header */}
      <div className="px-4 py-3 bg-white border-b border-gray-200 flex items-center gap-2">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round">
          <rect x="1" y="1" width="4" height="4" rx="0.5" />
          <rect x="7" y="1" width="4" height="4" rx="0.5" />
          <rect x="1" y="7" width="4" height="4" rx="0.5" />
          <rect x="7" y="7" width="4" height="4" rx="0.5" />
        </svg>
        <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">
          Properties
        </span>
      </div>

      <div className="flex flex-col gap-0">

        {/* ── Color Section ── */}
        <div className="bg-white mx-0 px-4 py-4 border-b border-gray-100">
          <SectionLabel>Color</SectionLabel>

          {/* Swatch grid — 6-col, 32px swatches, blue selection ring */}
          <div className="grid grid-cols-6 gap-2 mb-3">
            {PRESET_COLORS.map((c) => {
              const isSelected = options.color === c
              const isLight = LIGHT_COLORS.has(c)
              const isWhite = c === '#FFFFFF'
              return (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  title={c}
                  aria-label={`Set color to ${c}${isSelected ? ' (current)' : ''}`}
                  aria-pressed={isSelected}
                  className="relative w-8 h-8 rounded-lg transition-transform duration-100 hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-1"
                  style={{
                    background: c,
                    boxShadow: isSelected
                      ? `0 0 0 2px #fff, 0 0 0 4px #3B82F6`
                      : isWhite
                      ? 'inset 0 0 0 1px #D1D5DB, 0 1px 2px rgba(0,0,0,0.06)'
                      : '0 1px 3px rgba(0,0,0,0.18)',
                  }}
                >
                  {isSelected && (
                    <span
                      className="absolute inset-0 flex items-center justify-center"
                      aria-hidden="true"
                      style={{ color: isLight ? '#374151' : '#fff' }}
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="1.5,5 4,7.5 8.5,2.5" />
                      </svg>
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Custom color row */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex-shrink-0">
              <div
                className="w-8 h-8 rounded-md border border-gray-200 overflow-hidden cursor-pointer"
                style={{ background: options.color }}
              >
                <input
                  type="color"
                  value={options.color}
                  onChange={(e) => setColor(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-gray-400 uppercase tracking-wide">Hex</span>
              <span className="text-xs text-gray-700 font-mono font-medium tracking-wider">
                {options.color.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* ── Tool-specific sections ── */}
        {hasToolOptions && (
          <div className="bg-white px-4 py-4 border-b border-gray-100 flex flex-col gap-4">

            {/* Opacity (highlight tool) */}
            {showOpacity && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest select-none">
                    Opacity
                  </span>
                  <span className="text-[11px] font-semibold text-gray-600 tabular-nums bg-gray-100 rounded px-1.5 py-0.5 min-w-[2.5rem] text-center">
                    {Math.round(options.opacity * 100)}%
                  </span>
                </div>
                <StyledSlider
                  min={0.1}
                  max={1}
                  step={0.05}
                  value={options.opacity}
                  onChange={setOpacity}
                  label="Opacity"
                  accentColor="#F59E0B"
                />
                <div className="flex justify-between mt-1.5">
                  {['10%', '50%', '100%'].map((v) => (
                    <span key={v} className="text-[9px] text-gray-300 tabular-nums">{v}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Stroke width */}
            {showStroke && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest select-none">
                    Stroke
                  </span>
                  <span className="text-[11px] font-semibold text-gray-600 tabular-nums bg-gray-100 rounded px-1.5 py-0.5 min-w-[2.5rem] text-center">
                    {options.strokeWidth}px
                  </span>
                </div>
                <StyledSlider
                  min={1}
                  max={20}
                  step={1}
                  value={options.strokeWidth}
                  onChange={(v) => setStrokeWidth(Math.round(v))}
                  label="Stroke width"
                  accentColor="#EF4444"
                />
                {/* Visual stroke weight presets */}
                <div className="flex items-end justify-between mt-3 gap-2">
                  {[1, 5, 10, 20].map((w) => (
                    <button
                      key={w}
                      onClick={() => setStrokeWidth(w)}
                      aria-label={`Stroke ${w}px`}
                      className="flex flex-col items-center gap-1 flex-1 group"
                    >
                      <div
                        className={`w-full rounded-full transition-colors duration-150 ${
                          options.strokeWidth === w ? 'bg-red-400' : 'bg-gray-200 group-hover:bg-gray-300'
                        }`}
                        style={{ height: Math.max(1, Math.min(w, 6)) }}
                      />
                      <span className="text-[9px] text-gray-400 tabular-nums">{w}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Font size */}
            {showFont && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest select-none">
                    Font Size
                  </span>
                  <span className="text-[11px] font-semibold text-gray-600 tabular-nums bg-gray-100 rounded px-1.5 py-0.5 min-w-[2.5rem] text-center">
                    {options.fontSize}pt
                  </span>
                </div>
                <StyledSlider
                  min={8}
                  max={72}
                  step={1}
                  value={options.fontSize}
                  onChange={(v) => setFontSize(Math.round(v))}
                  label="Font size"
                  accentColor="#3B82F6"
                />
                {/* Quick size presets */}
                <div className="grid grid-cols-4 gap-1 mt-3">
                  {[10, 14, 18, 24].map((size) => (
                    <button
                      key={size}
                      onClick={() => setFontSize(size)}
                      aria-label={`Font size ${size}pt`}
                      className={`py-1 rounded-md text-[10px] font-medium transition-colors duration-150 ${
                        options.fontSize === size
                          ? 'bg-blue-500 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Shape selector */}
            {showShape && (
              <div>
                <SectionLabel>Shape</SectionLabel>
                <div className="grid grid-cols-2 gap-1.5">
                  {shapes.map((s) => {
                    const isActive = options.shapeKind === s.kind
                    return (
                      <button
                        key={s.kind}
                        onClick={() => setShapeKind(s.kind)}
                        aria-pressed={isActive}
                        className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium border transition-all duration-150 cursor-pointer ${
                          isActive
                            ? 'border-red-400 bg-red-50 text-red-600 shadow-sm'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 text-gray-500'
                        }`}
                      >
                        <span className={isActive ? 'text-red-500' : 'text-gray-400'}>
                          {ShapeIcons[s.kind]}
                        </span>
                        <span>{s.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Selected annotation actions ── */}
        {selectedAnnotation && (
          <div className="bg-white px-4 py-4 border-b border-gray-100">
            <SectionLabel>Selection</SectionLabel>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
              <span className="text-xs text-gray-600 capitalize font-medium">
                {selectedAnnotation.type.replace('-', ' ')}
              </span>
            </div>
            <button
              onClick={() => {
                removeAnnotation(selectedAnnotation.id)
                selectAnnotation(null)
              }}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-500 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 active:bg-red-200 transition-all duration-150 cursor-pointer"
            >
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1,3 10,3" />
                <path d="M4,3V1.5h3V3" />
                <path d="M2,3l0.75,6.5h5.5L9,3" />
              </svg>
              Delete
            </button>
          </div>
        )}

        {/* ── Empty state ── */}
        {!hasToolOptions && !selectedAnnotation && (
          <div className="px-4 py-8 flex flex-col items-center gap-2 text-center">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="4" width="8" height="8" rx="1.5" />
              <rect x="16" y="4" width="8" height="8" rx="1.5" />
              <rect x="4" y="16" width="8" height="8" rx="1.5" />
              <rect x="16" y="16" width="8" height="8" rx="1.5" />
            </svg>
            <p className="text-[11px] text-gray-400 leading-snug">
              Select a tool to see<br />its properties
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
