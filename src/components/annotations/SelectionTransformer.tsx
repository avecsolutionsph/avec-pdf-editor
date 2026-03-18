import { useEffect, useRef } from 'react'
import { Transformer } from 'react-konva'
import type Konva from 'konva'
import { useAnnotationStore } from '../../store/annotation.store'

interface Props {
  selectedId: string | null
}

export function SelectionTransformer({ selectedId }: Props) {
  const transformerRef = useRef<Konva.Transformer>(null)
  const { updateAnnotation } = useAnnotationStore()

  useEffect(() => {
    const tr = transformerRef.current
    if (!tr) return
    const stage = tr.getStage()
    if (!stage) return

    if (selectedId) {
      const node = stage.findOne(`#${selectedId}`)
      if (node) {
        tr.nodes([node])
        tr.getLayer()?.batchDraw()
      }
    } else {
      tr.nodes([])
      tr.getLayer()?.batchDraw()
    }
  }, [selectedId])

  if (!selectedId) return null

  return (
    <Transformer
      ref={transformerRef}
      boundBoxFunc={(oldBox, newBox) => {
        // Minimum size constraint
        if (newBox.width < 20 || newBox.height < 20) return oldBox
        return newBox
      }}
      onTransformEnd={() => {
        const tr = transformerRef.current
        if (!tr) return
        const node = tr.nodes()[0]
        if (!node) return
        updateAnnotation(selectedId, {
          x: node.x(),
          y: node.y(),
          // @ts-ignore - width/height exist on resizable shapes
          width: node.width() * node.scaleX(),
          // @ts-ignore
          height: node.height() * node.scaleY(),
        })
        node.scaleX(1)
        node.scaleY(1)
      }}
    />
  )
}
