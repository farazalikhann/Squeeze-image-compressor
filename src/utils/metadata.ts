export interface DetectedMetadata {
  hasMetadata: boolean
  camera?: string
  dateTaken?: string
  gps?: { latitude: number; longitude: number }
  otherFieldCount: number
}

/** Reads EXIF/GPS metadata from a file or blob entirely client-side via the
 *  `exifr` library (dynamically imported so it doesn't bloat the main bundle,
 *  same pattern as the HEIC converter). Never throws — a file with no
 *  metadata, or one exifr can't parse, just reports "nothing found". */
export async function readMetadata(source: File | Blob): Promise<DetectedMetadata> {
  try {
    const exifr = await import('exifr')
    const output = await exifr.parse(source, { gps: true, tiff: true, exif: true, translateValues: true })

    if (!output || typeof output !== 'object') {
      return { hasMetadata: false, otherFieldCount: 0 }
    }

    const make = typeof output.Make === 'string' ? output.Make.trim() : undefined
    const model = typeof output.Model === 'string' ? output.Model.trim() : undefined
    const camera =
      make && model
        ? model.toLowerCase().startsWith(make.toLowerCase())
          ? model
          : `${make} ${model}`
        : make || model || undefined
    const dateTaken =
      output.DateTimeOriginal instanceof Date
        ? output.DateTimeOriginal.toLocaleString()
        : typeof output.DateTimeOriginal === 'string'
          ? output.DateTimeOriginal
          : undefined
    const gps =
      typeof output.latitude === 'number' && typeof output.longitude === 'number'
        ? { latitude: output.latitude, longitude: output.longitude }
        : undefined

    const knownKeys = new Set(['Make', 'Model', 'DateTimeOriginal', 'latitude', 'longitude'])
    const otherFieldCount = Object.keys(output).filter((k) => !knownKeys.has(k)).length

    const hasMetadata = !!(camera || dateTaken || gps || otherFieldCount > 0)

    return { hasMetadata, camera, dateTaken, gps, otherFieldCount }
  } catch {
    return { hasMetadata: false, otherFieldCount: 0 }
  }
}
