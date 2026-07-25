import { getExtension } from './format'

function isHeic(file: File): boolean {
  const ext = getExtension(file.name)
  return (
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    ext === 'heic' ||
    ext === 'heif'
  )
}

/** Converts HEIC/HEIF files to JPEG so the rest of the pipeline can read them.
 *  Returns the original file untouched for any other format. */
export async function normalizeInputFile(file: File): Promise<File> {
  if (!isHeic(file)) return file
  const heic2any = (await import('heic2any')).default
  const result = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 })
  const blob = Array.isArray(result) ? result[0] : result
  const newName = `${file.name.replace(/\.(heic|heif)$/i, '')}.jpg`
  return new File([blob], newName, { type: 'image/jpeg' })
}

export interface LoadedImage {
  bitmap: ImageBitmap
  width: number
  height: number
}

/** Loads a file into an ImageBitmap, auto-applying EXIF orientation so the
 *  pixel data comes out upright (and metadata is discarded in the process). */
export async function loadImageBitmap(file: File): Promise<LoadedImage> {
  const normalized = await normalizeInputFile(file)

  try {
    const bitmap = await createImageBitmap(normalized, { imageOrientation: 'from-image' })
    return { bitmap, width: bitmap.width, height: bitmap.height }
  } catch {
    // Fallback path for browsers/formats that reject createImageBitmap directly.
    const url = URL.createObjectURL(normalized)
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new Image()
        el.onload = () => resolve(el)
        el.onerror = () => reject(new Error('Unable to decode image'))
        el.src = url
      })
      const bitmap = await createImageBitmap(img)
      return { bitmap, width: bitmap.width, height: bitmap.height }
    } finally {
      URL.revokeObjectURL(url)
    }
  }
}

export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return loadImageBitmap(file).then(({ width, height, bitmap }) => {
    bitmap.close()
    return { width, height }
  })
}
