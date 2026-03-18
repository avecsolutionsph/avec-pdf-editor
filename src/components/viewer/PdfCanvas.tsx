import { useEffect, useRef } from 'react'
import { renderPage } from '../../services/pdf-renderer.service'

interface Props {
  pageIndex: number
  scale: number
  onRendered?: (width: number, height: number) => void
}

export function PdfCanvas({ pageIndex, scale, onRendered }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let cancelled = false

    renderPage(pageIndex, canvas, scale).then(() => {
      if (!cancelled && onRendered) {
        onRendered(canvas.width, canvas.height)
      }
    })

    return () => { cancelled = true }
  }, [pageIndex, scale])

  return (
    <canvas
      ref={canvasRef}
      className="block"
      style={{ display: 'block' }}
    />
  )
}
