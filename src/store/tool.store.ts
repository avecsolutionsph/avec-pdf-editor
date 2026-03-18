import { create } from 'zustand'
import type { ToolMode, ToolOptions, ShapeKind } from '../types/tool.types'

interface ToolState {
  activeTool: ToolMode
  options: ToolOptions

  setTool: (tool: ToolMode) => void
  setColor: (color: string) => void
  setOpacity: (opacity: number) => void
  setStrokeWidth: (width: number) => void
  setFontSize: (size: number) => void
  setFontFamily: (family: string) => void
  setShapeKind: (kind: ShapeKind) => void
}

const defaultOptions: ToolOptions = {
  color: '#FFD600',
  opacity: 0.4,
  strokeWidth: 2,
  fontSize: 14,
  fontFamily: 'Helvetica',
  shapeKind: 'rect',
}

export const useToolStore = create<ToolState>()((set) => ({
  activeTool: 'select',
  options: defaultOptions,

  setTool: (activeTool) => set({ activeTool }),
  setColor: (color) => set((s) => ({ options: { ...s.options, color } })),
  setOpacity: (opacity) => set((s) => ({ options: { ...s.options, opacity } })),
  setStrokeWidth: (strokeWidth) => set((s) => ({ options: { ...s.options, strokeWidth } })),
  setFontSize: (fontSize) => set((s) => ({ options: { ...s.options, fontSize } })),
  setFontFamily: (fontFamily) => set((s) => ({ options: { ...s.options, fontFamily } })),
  setShapeKind: (shapeKind) => set((s) => ({ options: { ...s.options, shapeKind } })),
}))
