export async function readFileAsBytes(file: File): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer))
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

export function bytesToBlob(bytes: Uint8Array, mimeType = 'application/pdf'): Blob {
  // Ensure we have a plain ArrayBuffer (not SharedArrayBuffer) for Blob compatibility
  const buffer = bytes.buffer instanceof ArrayBuffer
    ? bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer
    : new Uint8Array(bytes).buffer as ArrayBuffer
  return new Blob([buffer], { type: mimeType })
}

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  URL.revokeObjectURL(url)
}

export function downloadBytes(bytes: Uint8Array, fileName: string): void {
  downloadBlob(bytesToBlob(bytes), fileName)
}

export function isPdf(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
}

export function isImage(file: File): boolean {
  return file.type.startsWith('image/') || /\.(png|jpe?g|gif|webp|bmp)$/i.test(file.name)
}

export function stripExtension(fileName: string): string {
  return fileName.replace(/\.[^/.]+$/, '')
}
