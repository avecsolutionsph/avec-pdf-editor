import { useUiStore } from '../../store/ui.store'
import { ZOOM_LEVELS, MIN_ZOOM, MAX_ZOOM } from '../../constants/tools'

export function ZoomControls() {
  const { zoom, setZoom, setFitMode } = useUiStore()

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
    <div className="flex items-center gap-1">
      <button
        onClick={zoomOut}
        className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600 text-sm font-medium"
        title="Zoom out"
      >
        −
      </button>
      <div className="flex items-center border border-gray-200 rounded overflow-hidden">
        <input
          type="number"
          value={Math.round(zoom * 100)}
          onChange={handleInput}
          className="w-14 text-center text-sm py-0.5 outline-none"
          min={10}
          max={500}
        />
        <span className="text-xs text-gray-400 pr-1.5">%</span>
      </div>
      <button
        onClick={zoomIn}
        className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600 text-sm font-medium"
        title="Zoom in"
      >
        +
      </button>
      <button
        onClick={() => setFitMode('width')}
        className="ml-1 px-2 py-0.5 text-xs rounded hover:bg-gray-100 text-gray-500 border border-gray-200"
        title="Fit to width"
      >
        Fit
      </button>
    </div>
  )
}
