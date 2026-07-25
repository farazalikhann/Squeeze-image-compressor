import type { CropArea, OutputFormat } from '../types'
import { DEFAULT_EDITS } from '../types'
import { loadImageBitmap } from './imageLoader'
import { renderEditedCanvas, canvasToBlob } from './canvasOps'
import { guessFormatFromFile, resolveEncodableFormat } from './resolveFormat'

export interface CropResult {
  blob: Blob
  width: number
  height: number
  format: OutputFormat
  formatFellBack: boolean
  timeMs: number
}

export async function cropImage(file: File, crop: CropArea, outputFormat: OutputFormat | 'keep'): Promise<CropResult> {
  const startedAt = performance.now()
  const { bitmap } = await loadImageBitmap(file)
  try {
    const canvas = renderEditedCanvas(bitmap, { ...DEFAULT_EDITS, crop })

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
