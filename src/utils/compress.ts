import imageCompression from 'browser-image-compression'
import type { CompressionMode, CompressionSettings, ImageEdits, OutputFormat } from '../types'
import { loadImageBitmap } from './imageLoader'
import { renderEditedCanvas, canvasToBlob } from './canvasOps'
import { canEncodeFormat } from './formatSupport'

export interface CompressResult {
  blob: Blob
  width: number
  height: number
  format: OutputFormat
  formatFellBack: boolean
  timeMs: number
  targetSizeReached?: boolean
}

const LOSSLESS_FORMATS: OutputFormat[] = ['image/png', 'image/webp']
const LOSSY_FORMATS: OutputFormat[] = ['image/jpeg', 'image/webp', 'image/avif']

function guessOriginalFormat(file: File): OutputFormat {
  switch (file.type) {
    case 'image/png':
      return 'image/png'
    case 'image/webp':
      return 'image/webp'
    case 'image/avif':
      return 'image/avif'
    default:
      return 'image/jpeg'
  }
}

function coerceFormatForMode(format: OutputFormat, mode: CompressionMode): OutputFormat {
  if (mode === 'lossless' && !LOSSLESS_FORMATS.includes(format)) return 'image/png'
  if ((mode === 'lossy' || mode === 'target') && !LOSSY_FORMATS.includes(format)) return 'image/jpeg'
  return format
}

async function resolveTargetFormat(
  file: File,
  settings: CompressionSettings,
  formatOverride: OutputFormat | null,
): Promise<{ format: OutputFormat; fellBack: boolean }> {
  let requested: OutputFormat =
    formatOverride ?? (settings.outputFormat === 'keep' ? guessOriginalFormat(file) : settings.outputFormat)
  requested = coerceFormatForMode(requested, settings.mode)

  const supported = await canEncodeFormat(requested)
  if (supported) return { format: requested, fellBack: false }

  const fallback: OutputFormat = requested === 'image/avif' ? 'image/webp' : 'image/jpeg'
  const fallbackOk = await canEncodeFormat(fallback)
  return { format: fallbackOk ? fallback : 'image/jpeg', fellBack: true }
}

interface BinarySearchResult {
  blob: Blob
  /** false when even the lowest quality setting couldn't get under targetBytes */
  reached: boolean
}

/** Binary-searches the quality parameter to land at or under a target byte size.
 *  Used for Smart/Max modes so the library-free formats (AVIF) behave like
 *  browser-image-compression does for JPEG/WebP/PNG, and for the explicit
 *  "Target size" mode where hitting the budget is the whole point. */
async function binarySearchEncode(
  canvas: HTMLCanvasElement,
  mime: string,
  targetBytes: number,
  minQ: number,
  maxQ: number,
  iterations = 6,
): Promise<BinarySearchResult> {
  const highBlob = await canvasToBlob(canvas, mime, maxQ)
  if (highBlob.size <= targetBytes) return { blob: highBlob, reached: true }

  const lowBlob = await canvasToBlob(canvas, mime, minQ)
  if (lowBlob.size > targetBytes) return { blob: lowBlob, reached: false }

  let lo = minQ
  let hi = maxQ
  let best = lowBlob
  for (let i = 0; i < iterations; i++) {
    const mid = (lo + hi) / 2
    const blob = await canvasToBlob(canvas, mime, mid)
    if (blob.size <= targetBytes) {
      best = blob
      lo = mid
    } else {
      hi = mid
    }
  }
  return { blob: best, reached: true }
}

async function encodeAvif(
  canvas: HTMLCanvasElement,
  settings: CompressionSettings,
  originalSize: number,
): Promise<Blob> {
  if (settings.mode === 'smart') {
    return (await binarySearchEncode(canvas, 'image/avif', originalSize * 0.5, 0.2, 0.85)).blob
  }
  if (settings.mode === 'max') {
    return (await binarySearchEncode(canvas, 'image/avif', originalSize * 0.25, 0.1, 0.6)).blob
  }
  return canvasToBlob(canvas, 'image/avif', settings.quality / 100)
}

async function compressWithLibrary(
  canvas: HTMLCanvasElement,
  format: OutputFormat,
  settings: CompressionSettings,
  originalSize: number,
): Promise<Blob> {
  const sourceBlob = await canvasToBlob(canvas, 'image/png')
  const sourceFile = new File([sourceBlob], 'source.png', { type: 'image/png' })

  const isMax = settings.mode === 'max'
  const targetMB = Math.max(0.02, (originalSize / (1024 * 1024)) * (isMax ? 0.25 : 0.55))

  return imageCompression(sourceFile, {
    maxSizeMB: targetMB,
    initialQuality: isMax ? 0.5 : 0.82,
    useWebWorker: true,
    alwaysKeepResolution: true,
    fileType: format,
    maxIteration: 8,
  })
}

export async function compressImage(
  file: File,
  edits: ImageEdits,
  settings: CompressionSettings,
): Promise<CompressResult> {
  const startedAt = performance.now()
  const { bitmap } = await loadImageBitmap(file)
  try {
    const canvas = renderEditedCanvas(bitmap, edits)
    const { format, fellBack } = await resolveTargetFormat(file, settings, edits.formatOverride)

    let blob: Blob
    let targetSizeReached: boolean | undefined

    if (settings.mode === 'target') {
      const targetBytes = Math.max(1024, Math.round(settings.targetSizeKB * 1024))
      const result = await binarySearchEncode(canvas, format, targetBytes, 0.01, 1, 10)
      blob = result.blob
      targetSizeReached = result.reached
    } else if (format === 'image/png') {
      blob = await canvasToBlob(canvas, format)
    } else if (settings.mode === 'lossless') {
      blob = await canvasToBlob(canvas, format, 1)
    } else if (format === 'image/avif') {
      blob = await encodeAvif(canvas, settings, file.size)
    } else if (settings.mode === 'smart' || settings.mode === 'max') {
      blob = await compressWithLibrary(canvas, format, settings, file.size)
    } else {
      blob = await canvasToBlob(canvas, format, settings.quality / 100)
    }

    return {
      blob,
      width: canvas.width,
      height: canvas.height,
      format,
      formatFellBack: fellBack,
      timeMs: Math.round(performance.now() - startedAt),
      targetSizeReached,
    }
  } finally {
    bitmap.close()
  }
}
