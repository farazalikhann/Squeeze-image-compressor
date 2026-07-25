export type CompressionMode = 'smart' | 'max' | 'custom' | 'lossless' | 'lossy' | 'target'

export type OutputFormat = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/avif'

export type QueueStatus = 'pending' | 'processing' | 'done' | 'error'

export interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

export interface ResizeSettings {
  enabled: boolean
  width: number | ''
  height: number | ''
  keepAspect: boolean
}

export interface ImageEdits {
  rotate: 0 | 90 | 180 | 270
  flipH: boolean
  flipV: boolean
  crop: CropArea | null
  resize: ResizeSettings
  stripExif: boolean
  formatOverride: OutputFormat | null
}

export interface CompressionSettings {
  mode: CompressionMode
  quality: number // 1-100, used by custom & lossy modes
  outputFormat: OutputFormat | 'keep'
  targetSizeKB: number // used by target mode
}

export interface QueueImage {
  id: string
  file: File
  originalUrl: string
  originalSize: number
  originalWidth: number
  originalHeight: number
  fileName: string
  status: QueueStatus
  errorMessage?: string
  progress: number
  processedBlob?: Blob
  processedUrl?: string
  processedSize?: number
  processedWidth?: number
  processedHeight?: number
  processedFormat?: OutputFormat
  processingTimeMs?: number
  edits: ImageEdits
  selected: boolean
}

export const DEFAULT_EDITS: ImageEdits = {
  rotate: 0,
  flipH: false,
  flipV: false,
  crop: null,
  resize: { enabled: false, width: '', height: '', keepAspect: true },
  stripExif: true,
  formatOverride: null,
}

export const DEFAULT_SETTINGS: CompressionSettings = {
  mode: 'smart',
  quality: 80,
  outputFormat: 'keep',
  targetSizeKB: 100,
}

export const FORMAT_LABELS: Record<OutputFormat, string> = {
  'image/jpeg': 'JPG',
  'image/png': 'PNG',
  'image/webp': 'WebP',
  'image/avif': 'AVIF',
}

export const FORMAT_EXT: Record<OutputFormat, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
}
