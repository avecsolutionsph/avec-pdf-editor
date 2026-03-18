import { useRef } from 'react'
import { Line } from 'react-konva'
import type Konva from 'konva'
import type { FreehandAnnotation } from '../../types/annotation.types'
import { useAnnotationStore } from '../../store/annotation.store'

interface Props {
  annotation: FreehandAnnotation
  isSelected: boolean
  selectable?: boolean
  preview?: boolean
}

export function FreehandAnnotationShape({ annotation, isSelected, selectable, preview }: Props) {
  const { selectAnnotation, updateAnnotation } = useAnnotationStore()
  const lineRef = useRef<Konva.Line>(null)

  return (
    <Line
      ref={lineRef}
      id={annotation.id}
      points={annotation.points}
      stroke={annotation.color}
      strokeWidth={annotation.strokeWidth}
      opacity={annotation.opacity}
      tension={0.4}
      lineCap="round"
      lineJoin="round"
      globalCompositeOperation="source-over"
      listening={!preview && selectable}
      draggable={selectable}
      onClick={() => selectable && selectAnnotation(annotation.id)}
      onTap={() => selectable && selectAnnotation(annotation.id)}
      onDragEnd={(e) => {
        const node = e.target
        // Shift all points by drag offset
        const dx = node.x()
        const dy = node.y()
        const newPoints = annotation.points.map((v, i) => (i % 2 === 0 ? v + dx : v + dy))
        updateAnnotation(annotation.id, { points: newPoints })
        node.position({ x: 0, y: 0 })
      }}
      shadowColor={isSelected ? '#3B82F6' : undefined}
      shadowBlur={isSelected ? 8 : 0}
    />
  )
}
