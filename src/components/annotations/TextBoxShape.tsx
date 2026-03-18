import { useRef, useEffect } from 'react'
import { Group, Rect, Text } from 'react-konva'
import type Konva from 'konva'
import type { TextBoxAnnotation } from '../../types/annotation.types'
import { useAnnotationStore } from '../../store/annotation.store'

interface Props {
  annotation: TextBoxAnnotation
  isSelected: boolean
  selectable?: boolean
}

export function TextBoxShape({ annotation, isSelected, selectable }: Props) {
  const groupRef = useRef<Konva.Group>(null)
  const { selectAnnotation, updateAnnotation } = useAnnotationStore()
  const textRef = useRef<Konva.Text>(null)

  // Auto-open editor for newly created empty text boxes
  useEffect(() => {
    if (annotation.content === '' && selectable) {
      openEditor()
    }
  }, [])

  const openEditor = () => {
    const stage = groupRef.current?.getStage()
    if (!stage) return
    const container = stage.container()
    const stageRect = container.getBoundingClientRect()
    const scale = stage.scaleX()

    const textarea = document.createElement('textarea')
    textarea.value = annotation.content
    textarea.style.cssText = `
      position: fixed;
      left: ${stageRect.left + annotation.x * scale}px;
      top: ${stageRect.top + annotation.y * scale}px;
      width: ${annotation.width * scale}px;
      min-height: ${annotation.fontSize * 1.5 * scale}px;
      padding: 4px;
      font-size: ${annotation.fontSize * scale}px;
      font-family: ${annotation.fontFamily}, sans-serif;
      color: ${annotation.color};
      border: 2px solid #3B82F6;
      border-radius: 2px;
      resize: none;
      z-index: 1000;
      background: rgba(255,255,255,0.9);
      outline: none;
      overflow: hidden;
    `
    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()

    // Auto-grow height
    const resize = () => {
      textarea.style.height = 'auto'
      textarea.style.height = textarea.scrollHeight + 'px'
    }
    textarea.addEventListener('input', resize)
    resize()

    const cleanup = () => {
      updateAnnotation(annotation.id, { content: textarea.value })
      document.body.removeChild(textarea)
    }
    textarea.addEventListener('blur', cleanup, { once: true })
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') textarea.blur()
    })
  }

  const displayText = annotation.content || (isSelected ? '│' : 'Double-click to edit')
  const textColor = annotation.content ? annotation.color : '#aaa'

  return (
    <Group
      ref={groupRef}
      id={annotation.id}
      draggable={selectable}
      listening={selectable}
      onClick={() => selectable && selectAnnotation(annotation.id)}
      onTap={() => selectable && selectAnnotation(annotation.id)}
      onDblClick={openEditor}
      onDragEnd={(e) => updateAnnotation(annotation.id, { x: e.target.x(), y: e.target.y() })}
    >
      {/* Background / border */}
      <Rect
        x={annotation.x}
        y={annotation.y}
        width={annotation.width}
        height={Math.max(annotation.fontSize * 1.8, (annotation.content.split('\n').length) * annotation.fontSize * 1.4 + 12)}
        fill="rgba(255,255,255,0.85)"
        stroke={isSelected ? '#3B82F6' : annotation.color}
        strokeWidth={isSelected ? 2 : 1}
        dash={annotation.content ? undefined : [4, 3]}
        cornerRadius={2}
      />
      <Text
        ref={textRef}
        x={annotation.x + 4}
        y={annotation.y + 6}
        width={annotation.width - 8}
        text={displayText}
        fontSize={annotation.fontSize}
        fontFamily={`${annotation.fontFamily}, sans-serif`}
        fill={textColor}
        wrap="word"
        listening={false}
      />
    </Group>
  )
}
