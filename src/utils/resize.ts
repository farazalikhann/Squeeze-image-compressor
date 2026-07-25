import type { OutputFormat } from '../types'
import { loadImageBitmap } from './imageLoader'
import { canvasToBlob } from './canvasOps'
import { guessFormatFromFile, resolveEncodableFormat } from './resolveFormat'

export interface ResizeResult {
  blob: Blob
  width: number
  height: number
  format: OutputFormat
  formatFellBack: boolean
  timeMs: number
}

export async function resizeImage(
  file: File,
  targetWidth: number,
  targetHeight: number,
  outputFormat: OutputFormat | 'keep',
): Promise<ResizeResult> {
  const startedAt = performance.now()
  const { bitmap } = await loadImageBitmap(file)
  try {
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(targetWidth))
    canvas.height = Math.max(1, Math.round(targetHeight))
    const ctx = canvas.getContext('2d')!
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)

    const requested = outputFormat === 'keep' ? guessFormatFromFile(file) : outputFormat
    const { format, fellBack } = await resolveEncodableFormat(requested)
    const quality = format === 'image/png' ? undefined : 0.92
    const blob = await canvasToBlob(canvas, format, quality)

    return {
      blob,
      width: canvas.width,
      height: canvas.height,
      format,
      formatFellBack: fellBack,
      timeMs: Math.round(performance.now() - startedAt),
    }
  } finally {
    bitmap.close()
  }
}
