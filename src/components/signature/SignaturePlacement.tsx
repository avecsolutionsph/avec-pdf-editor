import { useState, useEffect } from 'react'
import { Layer, Image as KonvaImage, Group, Rect, Text } from 'react-konva'
import useImage from 'use-image'
import type Konva from 'konva'
import { useSignatureStore } from '../../store/signature.store'
import { useToolStore } from '../../store/tool.store'

// ---------- Placed signature draggable node ----------
interface PlacedSigNodeProps {
  dataUrl: string
  x: number
  y: number
  width: number
  height: number
  id: string
  pageIndex: number
}

function PlacedSignatureNode({ dataUrl, x, y, width, height, id, pageIndex }: PlacedSigNodeProps) {
  const [image] = useImage(dataUrl)
  const [hovered, setHovered] = useState(false)
  const { addPlacement, removePlacement } = useSignatureStore()

  return (
    <Group
      x={x}
      y={y}
      draggable
      onDragEnd={(e) => {
        removePlacement(id, pageIndex)
        addPlacement({ signatureId: id, pageIndex, x: e.target.x(), y: e.target.y(), width, height })
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <KonvaImage image={image} width={width} height={height} />
      {hovered && (
        <>
          <Rect
            x={width - 18}
            y={-9}
            width={18}
            height={18}
            fill="#EF4444"
            cornerRadius={9}
            onClick={() => removePlacement(id, pageIndex)}
            onTap={() => removePlacement(id, pageIndex)}
          />
          <Text
            x={width - 18}
            y={-9}
            width={18}
            height={18}
            text="×"
            fontSize={12}
            fill="white"
            align="center"
            verticalAlign="middle"
            listening={false}
          />
        </>
      )}
    </Group>
  )
}

// ---------- Ghost that follows cursor ----------
function GhostNode({ dataUrl, stageRef }: { dataUrl: string; stageRef: React.RefObject<Konva.Stage | null> }) {
  const [image] = useImage(dataUrl)
  const [pos, setPos] = useState({ x: -9999, y: -9999 })

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const onMove = () => {
      const p = stage.getPointerPosition()
      if (p) setPos({ x: p.x - 80, y: p.y - 20 })
    }
    stage.container().addEventListener('mousemove', onMove)
    return () => stage.container().removeEventListener('mousemove', onMove)
  }, [stageRef])

  if (!image) return null
  const aspect = image.naturalWidth / Math.max(image.naturalHeight, 1)
  const w = 160
  return (
    <KonvaImage image={image} x={pos.x} y={pos.y} width={w} height={w / aspect} opacity={0.55} listening={false} />
  )
}

// ---------- Layer exported into AnnotationOverlay Stage ----------
export function SignatureLayer({ pageIndex, stageRef }: { pageIndex: number; stageRef: React.RefObject<Konva.Stage | null> }) {
  const { pendingSignature, placements, savedSignatures } = useSignatureStore()
  const { activeTool } = useToolStore()

  const isPlacing = activeTool === 'sign' && pendingSignature !== null
  const pagePlacements = placements.filter((p) => p.pageIndex === pageIndex)

  return (
    <>
      <Layer>
        {pagePlacements.map((p) => {
          const sig = savedSignatures.find((s) => s.id === p.signatureId)
          if (!sig) return null
          return (
            <PlacedSignatureNode
              key={`${p.signatureId}-${p.x}-${p.y}`}
              dataUrl={sig.dataUrl}
              x={p.x}
              y={p.y}
              width={p.width}
              height={p.height}
              id={p.signatureId}
              pageIndex={pageIndex}
            />
          )
        })}
      </Layer>

      {isPlacing && pendingSignature && (
        <Layer listening={false}>
          <GhostNode dataUrl={pendingSignature.dataUrl} stageRef={stageRef} />
        </Layer>
      )}
    </>
  )
}

// ---------- Click handler used by AnnotationOverlay ----------
export function useSignatureClickHandler(
  pageIndex: number,
  stageRef: React.RefObject<Konva.Stage | null>
) {
  const { pendingSignature, addPlacement, setPendingSignature } = useSignatureStore()
  const { activeTool } = useToolStore()

  return (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (activeTool !== 'sign' || !pendingSignature) return
    if (e.target !== stageRef.current) return
    const pos = stageRef.current?.getPointerPosition()
    if (!pos) return

    const aspect = pendingSignature.width / Math.max(pendingSignature.height, 1)
    const w = 160
    const h = w / aspect

    addPlacement({
      signatureId: pendingSignature.id,
      pageIndex,
      x: pos.x - w / 2,
      y: pos.y - h / 2,
      width: w,
      height: h,
    })
    setPendingSignature(null)
  }
}
