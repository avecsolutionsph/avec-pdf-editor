import { useRef, useState } from 'react'
import { Group, Rect, Text } from 'react-konva'
import type Konva from 'konva'
import type { StickyNoteAnnotation } from '../../types/annotation.types'
import { useAnnotationStore } from '../../store/annotation.store'

const NOTE_SIZE = 28
const POPUP_WIDTH = 200
const POPUP_HEIGHT = 120

interface Props {
  annotation: StickyNoteAnnotation
  isSelected: boolean
  selectable?: boolean
}

export function StickyNoteShape({ annotation, isSelected, selectable }: Props) {
  const groupRef = useRef<Konva.Group>(null)
  const { selectAnnotation, updateAnnotation } = useAnnotationStore()
  const [showPopup, setShowPopup] = useState(false)

  const handleDblClick = () => {
    // Open an HTML textarea for editing (positioned over the popup)
    const stage = groupRef.current?.getStage()
    if (!stage) return
    const container = stage.container()
    const stageRect = container.getBoundingClientRect()
    const x = stageRect.left + annotation.x
    const y = stageRect.top + annotation.y + NOTE_SIZE + 4

    const textarea = document.createElement('textarea')
    textarea.value = annotation.content
    textarea.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      width: ${POPUP_WIDTH}px;
      height: ${POPUP_HEIGHT}px;
      padding: 8px;
      font-size: 13px;
      font-family: sans-serif;
      border: 2px solid ${annotation.color};
      border-radius: 4px;
      resize: none;
      z-index: 1000;
      background: #fffde7;
      outline: none;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `
    document.body.appendChild(textarea)
    textarea.focus()

    const cleanup = () => {
      updateAnnotation(annotation.id, { content: textarea.value })
      document.body.removeChild(textarea)
    }
    textarea.addEventListener('blur', cleanup, { once: true })
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') textarea.blur()
    })
  }

  return (
    <Group
      ref={groupRef}
      id={annotation.id}
      x={annotation.x}
      y={annotation.y}
      draggable={selectable}
      listening={selectable}
      onClick={() => { selectable && selectAnnotation(annotation.id); setShowPopup((v) => !v) }}
      onTap={() => { selectable && selectAnnotation(annotation.id); setShowPopup((v) => !v) }}
      onDblClick={handleDblClick}
      onDragEnd={(e) => updateAnnotation(annotation.id, { x: e.target.x(), y: e.target.y() })}
    >
      {/* Icon */}
      <Rect
        width={NOTE_SIZE}
        height={NOTE_SIZE}
        fill={annotation.color}
        cornerRadius={4}
        shadowColor={isSelected ? '#3B82F6' : 'rgba(0,0,0,0.2)'}
        shadowBlur={isSelected ? 8 : 4}
        shadowOffsetY={2}
      />
      <Text
        text="📝"
        fontSize={16}
        x={6}
        y={6}
        listening={false}
      />

      {/* Popup bubble */}
      {(showPopup || isSelected) && annotation.content && (
        <>
          <Rect
            x={0}
            y={NOTE_SIZE + 4}
            width={POPUP_WIDTH}
            height={POPUP_HEIGHT}
            fill="#fffde7"
            stroke={annotation.color}
            strokeWidth={1.5}
            cornerRadius={4}
            shadowColor="rgba(0,0,0,0.15)"
            shadowBlur={8}
            shadowOffsetY={2}
          />
          <Text
            x={8}
            y={NOTE_SIZE + 12}
            width={POPUP_WIDTH - 16}
            height={POPUP_HEIGHT - 20}
            text={annotation.content}
            fontSize={13}
            fontFamily="sans-serif"
            fill="#333"
            wrap="word"
            ellipsis
            listening={false}
          />
        </>
      )}
    </Group>
  )
}
