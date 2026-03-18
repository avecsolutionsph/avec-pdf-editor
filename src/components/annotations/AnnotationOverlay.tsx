import { useRef, useCallback, useState } from 'react'
import { Stage, Layer } from 'react-konva'
import type Konva from 'konva'
import { useToolStore } from '../../store/tool.store'
import { useAnnotationStore } from '../../store/annotation.store'
import { FreehandAnnotationShape } from './FreehandAnnotationShape'
import { ShapeAnnotationShape } from './ShapeAnnotationShape'
import { HighlightAnnotationShape } from './HighlightAnnotationShape'
import { StickyNoteShape } from './StickyNoteShape'
import { TextBoxShape } from './TextBoxShape'
import { SelectionTransformer } from './SelectionTransformer'
import { SignatureLayer, useSignatureClickHandler } from '../signature/SignaturePlacement'
import type { Annotation, FreehandAnnotation, ShapeAnnotation, StickyNoteAnnotation, TextBoxAnnotation } from '../../types/annotation.types'
import { nanoid } from './nanoid'

interface Props {
  pageIndex: number
  width: number
  height: number
}

export function AnnotationOverlay({ pageIndex, width, height }: Props) {
  const stageRef = useRef<Konva.Stage>(null)
  const { activeTool, options } = useToolStore()
  const handleSignatureClick = useSignatureClickHandler(pageIndex, stageRef)
  const { addAnnotation, selectAnnotation, selectedId, getAnnotationsForPage } = useAnnotationStore()

  // In-progress state
  const isDrawing = useRef(false)
  const [inProgressPoints, setInProgressPoints] = useState<number[]>([])
  const [inProgressShape, setInProgressShape] = useState<{
    x: number; y: number; width: number; height: number
  } | null>(null)
  const startPos = useRef<{ x: number; y: number } | null>(null)

  const pageAnnotations = getAnnotationsForPage(pageIndex)

  const getRelativePos = (_e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    const stage = stageRef.current
    if (!stage) return { x: 0, y: 0 }
    const pos = stage.getPointerPosition()
    return pos ?? { x: 0, y: 0 }
  }

  const handleMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (activeTool === 'select' || activeTool === 'hand' || activeTool === 'text-edit') return
    if (e.target !== e.target.getStage() && activeTool !== 'draw') return

    const pos = getRelativePos(e)
    isDrawing.current = true
    startPos.current = pos

    if (activeTool === 'draw') {
      setInProgressPoints([pos.x, pos.y])
    } else if (activeTool === 'shape' || activeTool === 'text-box') {
      setInProgressShape({ x: pos.x, y: pos.y, width: 0, height: 0 })
    }
  }, [activeTool])

  const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isDrawing.current) return
    const pos = getRelativePos(e)

    if (activeTool === 'draw') {
      setInProgressPoints((pts) => [...pts, pos.x, pos.y])
    } else if ((activeTool === 'shape' || activeTool === 'text-box') && startPos.current) {
      setInProgressShape({
        x: Math.min(startPos.current.x, pos.x),
        y: Math.min(startPos.current.y, pos.y),
        width: Math.abs(pos.x - startPos.current.x),
        height: Math.abs(pos.y - startPos.current.y),
      })
    }
  }, [activeTool])

  const handleMouseUp = useCallback(() => {
    if (!isDrawing.current) return
    isDrawing.current = false

    if (activeTool === 'draw' && inProgressPoints.length >= 4) {
      const annotation: FreehandAnnotation = {
        id: nanoid(),
        type: 'freehand',
        pageIndex,
        color: options.color,
        opacity: options.opacity,
        createdAt: Date.now(),
        points: inProgressPoints,
        strokeWidth: options.strokeWidth,
      }
      addAnnotation(annotation)
    } else if (activeTool === 'shape' && inProgressShape && inProgressShape.width > 5 && inProgressShape.height > 5) {
      const annotation: ShapeAnnotation = {
        id: nanoid(),
        type: 'shape',
        pageIndex,
        color: options.color,
        opacity: options.opacity,
        createdAt: Date.now(),
        shape: options.shapeKind,
        x: inProgressShape.x,
        y: inProgressShape.y,
        width: inProgressShape.width,
        height: inProgressShape.height,
        strokeWidth: options.strokeWidth,
        fill: 'transparent',
      }
      addAnnotation(annotation)
    } else if (activeTool === 'text-box' && inProgressShape && inProgressShape.width > 20) {
      const annotation: TextBoxAnnotation = {
        id: nanoid(),
        type: 'text-box',
        pageIndex,
        color: options.color,
        opacity: 1,
        createdAt: Date.now(),
        x: inProgressShape.x,
        y: inProgressShape.y,
        width: inProgressShape.width,
        content: '',
        fontSize: options.fontSize,
        fontFamily: options.fontFamily,
      }
      addAnnotation(annotation)
    }

    setInProgressPoints([])
    setInProgressShape(null)
    startPos.current = null
  }, [activeTool, inProgressPoints, inProgressShape, options, pageIndex, addAnnotation])

  const handleStageClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (activeTool === 'sign') {
      handleSignatureClick(e)
      return
    }
    if (activeTool === 'sticky-note') {
      const pos = getRelativePos(e)
      const annotation: StickyNoteAnnotation = {
        id: nanoid(),
        type: 'sticky-note',
        pageIndex,
        color: '#FFD600',
        opacity: 1,
        createdAt: Date.now(),
        x: pos.x,
        y: pos.y,
        content: '',
      }
      addAnnotation(annotation)
      return
    }
    // Deselect when clicking on empty stage
    if (e.target === e.target.getStage()) {
      selectAnnotation(null)
    }
  }, [activeTool, pageIndex, addAnnotation, selectAnnotation])

  const isInteractive = activeTool !== 'hand' && activeTool !== 'text-edit'
  const cursor =
    activeTool === 'draw' || activeTool === 'highlight' ? 'crosshair'
    : activeTool === 'sticky-note' ? 'cell'
    : activeTool === 'sign' ? 'copy'
    : activeTool === 'hand' ? 'grab'
    : activeTool === 'select' ? 'default'
    : 'crosshair'

  return (
    <Stage
      ref={stageRef}
      width={width}
      height={height}
      style={{ position: 'absolute', inset: 0, cursor, pointerEvents: isInteractive ? 'auto' : 'none' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={handleStageClick}
    >
      {/* Committed annotations */}
      <Layer>
        {pageAnnotations.map((a) => renderAnnotation(a, selectedId, activeTool === 'select'))}
        <SelectionTransformer selectedId={selectedId} />
      </Layer>

      {/* Signature placement layer */}
      <SignatureLayer pageIndex={pageIndex} stageRef={stageRef} />

      {/* In-progress drawing layer */}
      <Layer listening={false}>
        {activeTool === 'draw' && inProgressPoints.length >= 4 && (
          <FreehandAnnotationShape
            annotation={{
              id: '__preview__',
              type: 'freehand',
              pageIndex,
              color: options.color,
              opacity: options.opacity,
              createdAt: 0,
              points: inProgressPoints,
              strokeWidth: options.strokeWidth,
            }}
            isSelected={false}
            preview
          />
        )}
        {(activeTool === 'shape' || activeTool === 'text-box') && inProgressShape && inProgressShape.width > 2 && (
          <ShapeAnnotationShape
            annotation={{
              id: '__preview__',
              type: 'shape',
              pageIndex,
              color: options.color,
              opacity: 0.5,
              createdAt: 0,
              shape: activeTool === 'text-box' ? 'rect' : options.shapeKind,
              x: inProgressShape.x,
              y: inProgressShape.y,
              width: inProgressShape.width,
              height: inProgressShape.height,
              strokeWidth: options.strokeWidth,
              fill: activeTool === 'text-box' ? 'rgba(255,255,255,0.8)' : 'transparent',
            }}
            isSelected={false}
            preview
          />
        )}
      </Layer>
    </Stage>
  )
}

function renderAnnotation(a: Annotation, selectedId: string | null, selectable: boolean) {
  const isSelected = selectedId === a.id
  switch (a.type) {
    case 'freehand':
      return <FreehandAnnotationShape key={a.id} annotation={a} isSelected={isSelected} selectable={selectable} />
    case 'shape':
      return <ShapeAnnotationShape key={a.id} annotation={a} isSelected={isSelected} selectable={selectable} />
    case 'highlight':
      return <HighlightAnnotationShape key={a.id} annotation={a} isSelected={isSelected} selectable={selectable} />
    case 'sticky-note':
      return <StickyNoteShape key={a.id} annotation={a} isSelected={isSelected} selectable={selectable} />
    case 'text-box':
      return <TextBoxShape key={a.id} annotation={a} isSelected={isSelected} selectable={selectable} />
    default:
      return null
  }
}
