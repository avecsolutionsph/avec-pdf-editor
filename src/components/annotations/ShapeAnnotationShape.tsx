import { useRef } from 'react'
import { Rect, Ellipse, Arrow, Line } from 'react-konva'
import type Konva from 'konva'
import type { ShapeAnnotation } from '../../types/annotation.types'
import { useAnnotationStore } from '../../store/annotation.store'

interface Props {
  annotation: ShapeAnnotation
  isSelected: boolean
  selectable?: boolean
  preview?: boolean
}

export function ShapeAnnotationShape({ annotation, isSelected, selectable, preview }: Props) {
  const groupRef = useRef<Konva.Group>(null)
  const { selectAnnotation, updateAnnotation } = useAnnotationStore()

  const commonProps = {
    stroke: annotation.color,
    strokeWidth: annotation.strokeWidth,
    opacity: annotation.opacity,
    fill: annotation.fill === 'transparent' ? undefined : annotation.fill,
    listening: !preview && selectable,
    draggable: selectable,
    onClick: () => selectable && selectAnnotation(annotation.id),
    onTap: () => selectable && selectAnnotation(annotation.id),
  }

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    updateAnnotation(annotation.id, {
      x: e.target.x(),
      y: e.target.y(),
    })
  }

  const shadow = isSelected
    ? { shadowColor: '#3B82F6', shadowBlur: 8, shadowOpacity: 0.8 }
    : {}

  switch (annotation.shape) {
    case 'rect':
      return (
        <Rect
          ref={groupRef as React.Ref<Konva.Rect>}
          id={annotation.id}
          x={annotation.x}
          y={annotation.y}
          width={annotation.width}
          height={annotation.height}
          {...commonProps}
          {...shadow}
          onDragEnd={handleDragEnd}
        />
      )

    case 'ellipse':
      return (
        <Ellipse
          ref={groupRef as React.Ref<Konva.Ellipse>}
          id={annotation.id}
          x={annotation.x + annotation.width / 2}
          y={annotation.y + annotation.height / 2}
          radiusX={annotation.width / 2}
          radiusY={annotation.height / 2}
          {...commonProps}
          {...shadow}
          onDragEnd={handleDragEnd}
        />
      )

    case 'arrow':
      return (
        <Arrow
          ref={groupRef as React.Ref<Konva.Arrow>}
          id={annotation.id}
          points={[annotation.x, annotation.y + annotation.height / 2, annotation.x + annotation.width, annotation.y + annotation.height / 2]}
          pointerLength={10}
          pointerWidth={8}
          {...commonProps}
          {...shadow}
          onDragEnd={handleDragEnd}
        />
      )

    case 'line':
      return (
        <Line
          ref={groupRef as React.Ref<Konva.Line>}
          id={annotation.id}
          points={[annotation.x, annotation.y + annotation.height / 2, annotation.x + annotation.width, annotation.y + annotation.height / 2]}
          {...commonProps}
          {...shadow}
          onDragEnd={handleDragEnd}
        />
      )

    default:
      return null
  }
}
