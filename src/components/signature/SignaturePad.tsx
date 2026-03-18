import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import SigPad from 'signature_pad'

export interface SignaturePadHandle {
  toDataURL: () => string
  isEmpty: () => boolean
  clear: () => void
}

interface Props {
  width?: number
  height?: number
  penColor?: string
}

export const SignaturePad = forwardRef<SignaturePadHandle, Props>(
  ({ width = 480, height = 200, penColor = '#111' }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const padRef = useRef<SigPad | null>(null)

    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ratio = window.devicePixelRatio || 1
      canvas.width = width * ratio
      canvas.height = height * ratio
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      const ctx = canvas.getContext('2d')!
      ctx.scale(ratio, ratio)

      padRef.current = new SigPad(canvas, {
        penColor,
        minWidth: 1,
        maxWidth: 3,
      })

      return () => padRef.current?.off()
    }, [width, height, penColor])

    useImperativeHandle(ref, () => ({
      toDataURL: () => padRef.current?.toDataURL('image/png') ?? '',
      isEmpty: () => padRef.current?.isEmpty() ?? true,
      clear: () => padRef.current?.clear(),
    }))

    return (
      <canvas
        ref={canvasRef}
        className="border border-gray-200 rounded-lg bg-white cursor-crosshair"
        style={{ touchAction: 'none' }}
      />
    )
  }
)
