import { useMemo, useState } from 'react'
import type { QueueImage } from '../types'
import { applyRenamePattern, sanitizeFileName } from '../utils/rename'
import { getExtension, stripExtension } from '../utils/format'

interface Props {
  images: QueueImage[]
  onClose: () => void
  onApply: (names: Map<string, string>) => void
}

export default function BatchRenameModal({ images, onClose, onApply }: Props) {
  const [pattern, setPattern] = useState('photo_{n}')

  const preview = useMemo(() => {
    return images.slice(0, 5).map((img, i) => {
      const base = sanitizeFileName(applyRenamePattern(pattern, i, images.length, img.fileName))
      const ext = getExtension(img.fileName) || 'jpg'
      return `${base}.${ext}`
    })
  }, [pattern, images])

  const handleApply = () => {
    const names = new Map<string, string>()
    images.forEach((img, i) => {
      const base = sanitizeFileName(applyRenamePattern(pattern, i, images.length, img.fileName))
      const ext = getExtension(img.fileName) || getExtension(stripExtension(img.file.name)) || 'jpg'
      names.set(img.id, `${base}.${ext}`)
    })
    onApply(names)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-900"
      >
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Rename all files</h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Use <code className="rounded bg-slate-100 px-1 py-0.5 dark:bg-slate-800">{'{n}'}</code> for the image
          number and <code className="rounded bg-slate-100 px-1 py-0.5 dark:bg-slate-800">{'{name}'}</code> for the
          original name.
        </p>

        <input
          type="text"
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          placeholder="photo_{n}"
          className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />

        <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
          <p className="mb-1 font-medium text-slate-500 dark:text-slate-400">Preview</p>
          {preview.map((name, i) => (
            <p key={i} className="truncate">
              {name}
            </p>
          ))}
          {images.length > 5 && <p className="text-slate-400">…and {images.length - 5} more</p>}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Apply to {images.length} files
          </button>
        </div>
      </div>
    </div>
  )
}
