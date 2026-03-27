import { useUiStore } from '../../store/ui.store'
import { ZOOM_LEVELS, MIN_ZOOM, MAX_ZOOM } from '../../constants/tools'

export function ZoomControls() {
  const { zoom, setZoom, setFitMode } = useUiStore()

  const atMin = zoom <= MIN_ZOOM
  const atMax = zoom >= MAX_ZOOM

  const zoomIn = () => {
    const next = ZOOM_LEVELS.find((z) => z > zoom) ?? MAX_ZOOM
    setZoom(next)
  }

  const zoomOut = () => {
    const prev = [...ZOOM_LEVELS].reverse().find((z) => z < zoom) ?? MIN_ZOOM
    setZoom(prev)
  }

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value)
    if (!isNaN(val) && val >= 10 && val <= 500) {
      setZoom(val / 100)
    }
  }

  return (
    <div className="flex items-center gap-0.5">
      <button
        onClick={zoomOut}
        disabled={atMin}
        className={[
          'w-7 h-7 flex items-center justify-center rounded-lg text-sm font-medium transition-colors duration-150',
          atMin
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800 active:bg-gray-200 cursor-pointer',
        ].join(' ')}
        title="Zoom out"
        aria-label="Zoom out"
      >
        −
      </button>

      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-colors duration-150">
        <input
          type="number"
          value={Math.round(zoom * 100)}
          onChange={handleInput}
          className="w-12 text-center text-xs py-1 outline-none bg-transparent"
          min={10}
          max={500}
          aria-label="Zoom level"
        />
        <span className="text-xs text-gray-400 pr-1.5 select-none">%</span>
      </div>

      <button
        onClick={zoomIn}
        disabled={atMax}
        className={[
          'w-7 h-7 flex items-center justify-center rounded-lg text-sm font-medium transition-colors duration-150',
          atMax
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800 active:bg-gray-200 cursor-pointer',
        ].join(' ')}
        title="Zoom in"
        aria-label="Zoom in"
      >
        +
      </button>

      <button
        onClick={() => setFitMode('width')}
        className="ml-1 px-2 py-1 text-xs rounded-lg border border-gray-200 text-gray-500 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-700 hover:border-gray-300 active:bg-gray-200"
        aria-label="Fit to width"
        title="Fit to width"
      >
        Fit
      </button>
    </div>
  )
}
