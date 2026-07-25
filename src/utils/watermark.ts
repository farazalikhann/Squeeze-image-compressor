import type { OutputFormat } from '../types'
import { loadImageBitmap } from './imageLoader'
import { canvasToBlob } from './canvasOps'
import { guessFormatFromFile, resolveEncodableFormat } from './resolveFormat'

export type WatermarkPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'middle-left'
  | 'center'
  | 'middle-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'

export interface WatermarkSettings {
  mode: 'text' | 'logo'
  text: string
  fontSize: number
  color: string
  opacity: number
  position: WatermarkPosition
  logoBitmap: ImageBitmap | null
  outputFormat: OutputFormat | 'keep'
}

export interface WatermarkResult {
  blob: Blob
  width: number
  height: number
  format: OutputFormat
  formatFellBack: boolean
  timeMs: number
}

/** Anchors a contentW x contentH box within a canvasW x canvasH area per one
 *  of the 9 grid positions, with a small padding margin from the edges. */
export function anchorForPosition(
  position: WatermarkPosition,
  canvasW: number,
  canvasH: number,
  contentW: number,
  contentH: number,
  padding: number,
): { x: number; y: number } {
  let x: number
  if (position.endsWith('left')) x = padding
  else if (position.endsWith('right')) x = canvasW - contentW - padding
  else x = (canvasW - contentW) / 2

  let y: number
  if (position.startsWith('top')) y = padding
  else if (position.startsWith('bottom')) y = canvasH - contentH - padding
  else y = (canvasH - contentH) / 2

  return { x, y }
}

export async function watermarkImage(file: File, settings: WatermarkSettings): Promise<WatermarkResult> {
  const startedAt = performance.now()
  const { bitmap } = await loadImageBitmap(file)
  try {
    const canvas = document.createElement('canvas')
    canvas.width = bitmap.width
    canvas.height = bitmap.height
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(bitmap, 0, 0)

    const padding = Math.max(8, Math.round(Math.min(canvas.width, canvas.height) * 0.04))

    ctx.save()
    ctx.globalAlpha = settings.opacity

    if (settings.mode === 'logo') {
      if (!settings.logoBitmap) throw new Error('No logo image selected')
      const logoW = Math.round(canvas.width * 0.18)
      const logoAspect = settings.logoBitmap.width / settings.logoBitmap.height
      const logoH = Math.max(1, Math.round(logoW / logoAspect))
      const { x, y } = anchorForPosition(settings.position, canvas.width, canvas.height, logoW, logoH, padding)
      ctx.drawImage(settings.logoBitmap, x, y, logoW, logoH)
    } else {
      const text = settings.text.trim() || 'Watermark'
      ctx.font = `700 ${settings.fontSize}px system-ui, -apple-system, sans-serif`
      ctx.fillStyle = settings.color
      ctx.textBaseline = 'top'
      const metrics = ctx.measureText(text)
      const textW = metrics.width
      const textH = settings.fontSize * 1.2
      const { x, y } = anchorForPosition(settings.position, canvas.width, canvas.height, textW, textH, padding)
      ctx.fillText(text, x, y)
    }
    ctx.restore()

    const requested = settings.outputFormat === 'keep' ? guessFormatFromFile(file) : settings.outputFormat
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
