import type { DetectedFont } from '../../services/font-detection.service'

interface Props {
  font: DetectedFont | null
}

export function FontMatchIndicator({ font }: Props) {
  if (!font) return null

  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg text-xs">
      <span className="text-blue-500 font-medium">Editing:</span>
      <span
        className="text-gray-700 font-medium"
        style={{ fontFamily: font.cssFamily }}
      >
        {font.family}
      </span>
      <span className="text-gray-400">{Math.round(font.size)}pt</span>
      {font.bold && (
        <span className="font-bold text-gray-600 border border-gray-300 px-1 rounded">B</span>
      )}
      {font.italic && (
        <span className="italic text-gray-600 border border-gray-300 px-1 rounded">I</span>
      )}
      {font.monospace && (
        <span className="font-mono text-gray-500 border border-gray-300 px-1 rounded text-[9px]">Mono</span>
      )}
    </div>
  )
}
