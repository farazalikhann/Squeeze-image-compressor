import type { OutputFormat } from '../types'
import { loadImageBitmap } from './imageLoader'
import { canvasToBlob } from './canvasOps'
import { resolveEncodableFormat } from './resolveFormat'

export interface ConvertResult {
  blob: Blob
  width: number
  height: number
  format: OutputFormat
  formatFellBack: boolean
  timeMs: number
}

/** Re-encodes a file into `targetFormat` at its original dimensions — no
 *  resizing, no quality-driven compression, just a format swap. */
export async function convertImage(file: File, targetFormat: OutputFormat): Promise<ConvertResult> {
  const startedAt = performance.now()
  const { bitmap } = await loadImageBitmap(file)
  try {
    const canvas = document.createElement('canvas')
    canvas.width = bitmap.width
    canvas.height = bitmap.height
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(bitmap, 0, 0)

    const { format, fellBack } = await resolveEncodableFormat(targetFormat)
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
