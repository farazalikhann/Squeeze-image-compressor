import type { OutputFormat } from '../types'
import { canEncodeFormat } from './formatSupport'

export function guessFormatFromFile(file: File): OutputFormat {
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

/** Resolves `requested` to a format the current browser can actually encode,
 *  falling back to WebP (for AVIF) or JPEG otherwise. */
export async function resolveEncodableFormat(
  requested: OutputFormat,
): Promise<{ format: OutputFormat; fellBack: boolean }> {
  const supported = await canEncodeFormat(requested)
  if (supported) return { format: requested, fellBack: false }

  const fallback: OutputFormat = requested === 'image/avif' ? 'image/webp' : 'image/jpeg'
  const fallbackOk = await canEncodeFormat(fallback)
  return { format: fallbackOk ? fallback : 'image/jpeg', fellBack: true }
}
