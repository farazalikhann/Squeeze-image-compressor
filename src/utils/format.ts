export function formatBytes(bytes: number, decimals = 2): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '0 B'
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1)
  const value = bytes / Math.pow(k, i)
  return `${value.toFixed(i === 0 ? 0 : decimals)} ${sizes[i]}`
}

export function formatPercent(original: number, compressed: number): number {
  if (!original || original <= 0) return 0
  const saved = ((original - compressed) / original) * 100
  return Math.max(0, Math.round(saved * 10) / 10)
}

export function genId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export function stripExtension(fileName: string): string {
  const idx = fileName.lastIndexOf('.')
  return idx > 0 ? fileName.slice(0, idx) : fileName
}

export function getExtension(fileName: string): string {
  const idx = fileName.lastIndexOf('.')
  return idx > 0 ? fileName.slice(idx + 1).toLowerCase() : ''
}
