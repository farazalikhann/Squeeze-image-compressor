import type { OutputFormat } from '../types'

const cache = new Map<OutputFormat, Promise<boolean>>()

/** Detects whether the current browser can actually *encode* a given mime type
 *  via canvas.toBlob (browsers silently fall back to PNG when unsupported). */
export function canEncodeFormat(mime: OutputFormat): Promise<boolean> {
  if (mime === 'image/jpeg' || mime === 'image/png') return Promise.resolve(true)

  const cached = cache.get(mime)
  if (cached) return cached

  const promise = new Promise<boolean>((resolve) => {
    try {
      const canvas = document.createElement('canvas')
      canvas.width = 2
      canvas.height = 2
      canvas.toBlob(
        (blob) => {
          resolve(!!blob && blob.type === mime)
        },
        mime,
        0.8,
      )
    } catch {
      resolve(false)
    }
  })

  cache.set(mime, promise)
  return promise
}

export async function pickSupportedFormat(
  preferred: OutputFormat,
  fallback: OutputFormat = 'image/jpeg',
): Promise<OutputFormat> {
  const supported = await canEncodeFormat(preferred)
  return supported ? preferred : fallback
}
