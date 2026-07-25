/** Applies a rename pattern like "photo_{n}" or "vacation-{n}-{name}" across a batch.
 *  {n} -> 1-based index (padded to the batch width), {name} -> original file name (no extension). */
export function applyRenamePattern(
  pattern: string,
  index: number,
  total: number,
  originalName: string,
): string {
  const pad = String(total).length
  const n = String(index + 1).padStart(Math.max(pad, 1), '0')
  const dot = originalName.lastIndexOf('.')
  const nameNoExt = dot > 0 ? originalName.slice(0, dot) : originalName

  return pattern.replace(/\{n\}/g, n).replace(/\{name\}/g, nameNoExt)
}

export function sanitizeFileName(name: string): string {
  return name.replace(/[/\\?%*:|"<>]/g, '-').trim() || 'image'
}
