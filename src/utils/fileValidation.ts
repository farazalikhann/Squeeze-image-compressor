export const MAX_FILES = 100

const ACCEPTED_EXT = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'heic', 'heif']
const ACCEPTED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/heic', 'image/heif'])

export function isAcceptedImageFile(file: File): boolean {
  const ext = file.name.toLowerCase().split('.').pop() ?? ''
  return ACCEPTED_TYPES.has(file.type) || ACCEPTED_EXT.includes(ext)
}
