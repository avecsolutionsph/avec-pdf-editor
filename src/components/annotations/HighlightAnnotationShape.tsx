import { Rect, Group } from 'react-konva'
import type { HighlightAnnotation } from '../../types/annotation.types'
import { useAnnotationStore } from '../../store/annotation.store'

interface Props {
  annotation: HighlightAnnotation
  isSelected: boolean
  selectable?: boolean
}

export function HighlightAnnotationShape({ annotation, isSelected, selectable }: Props) {
  const { selectAnnotation } = useAnnotationStore()

  return (
    <Group
      id={annotation.id}
      listening={selectable}
      onClick={() => selectable && selectAnnotation(annotation.id)}
      onTap={() => selectable && selectAnnotation(annotation.id)}
    >
      {annotation.rects.map((rect, i) => (
        <Rect
          key={i}
          x={rect.x}
          y={rect.y}
          width={rect.width}
          height={rect.height}
          fill={annotation.color}
          opacity={annotation.opacity}
          globalCompositeOperation="multiply"
          shadowColor={isSelected ? '#3B82F6' : undefined}
          shadowBlur={isSelected ? 6 : 0}
        />
      ))}
    </Group>
  )
}
