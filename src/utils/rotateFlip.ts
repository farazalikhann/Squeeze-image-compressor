import type { OutputFormat } from '../types'
import { DEFAULT_EDITS } from '../types'
import { loadImageBitmap } from './imageLoader'
import { renderEditedCanvas, canvasToBlob } from './canvasOps'
import { guessFormatFromFile, resolveEncodableFormat } from './resolveFormat'

export interface RotateFlipResult {
  blob: Blob
  width: number
  height: number
  format: OutputFormat
  formatFellBack: boolean
  timeMs: number
}

export async function rotateFlipImage(
  file: File,
  rotate: 0 | 90 | 180 | 270,
  flipH: boolean,
  flipV: boolean,
  outputFormat: OutputFormat | 'keep',
): Promise<RotateFlipResult> {
  const startedAt = performance.now()
  const { bitmap } = await loadImageBitmap(file)
  try {
    const canvas = renderEditedCanvas(bitmap, { ...DEFAULT_EDITS, rotate, flipH, flipV })

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
