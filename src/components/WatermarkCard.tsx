import type { MediaItem } from '../hooks/useMediaQueue'
import { formatBytes, formatDuration } from '../utils/format'
import StatusBadge from './StatusBadge'

interface Props {
  image: MediaItem
  onRemove: (id: string) => void
  onPreview: (id: string) => void
  onDownload: (id: string) => void
  onApply: (id: string) => void
  onToggleSelect: (id: string) => void
}

export default function WatermarkCard({ image, onRemove, onPreview, onDownload, onApply, onToggleSelect }: Props) {
  const hasResult = image.status === 'done' && image.processedSize != null

  return (
    <div className="group relative flex animate-fade-in gap-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900 sm:p-4">
      <label className="absolute left-3 top-3 z-10 sm:left-4 sm:top-4">
        <input
          type="checkbox"
          checked={image.selected}
          onChange={() => onToggleSelect(image.id)}
          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800"
        />
      </label>

      <button
        type="button"
        onClick={() => onPreview(image.id)}
        className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 sm:h-28 sm:w-28"
      >
        <img src={image.processedUrl ?? image.originalUrl} alt={image.fileName} className="h-full w-full object-cover" />
        <StatusBadge status={image.status} />
      </button>

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate pr-6 text-sm font-medium text-slate-800 dark:text-slate-100" title={image.fileName}>
            {image.fileName}
          </p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {image.originalWidth > 0 ? `${image.originalWidth}×${image.originalHeight}` : image.status === 'error' ? '—' : 'Reading…'}
          </p>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
            <span className="text-slate-500 dark:text-slate-400">{formatBytes(image.originalSize)}</span>
            {hasResult && (
              <>
                <span className="text-slate-400">→</span>
                <span className="font-medium text-slate-700 dark:text-slate-200">{formatBytes(image.processedSize!)}</span>
                {image.processingTimeMs != null && (
                  <span className="text-slate-400 dark:text-slate-500">⏱ {formatDuration(image.processingTimeMs)}</span>
                )}
              </>
            )}
            {image.status === 'error' && (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                {image.errorMessage ?? 'Failed'}
              </span>
            )}
            {hasResult && image.errorMessage && (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                {image.errorMessage}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => onApply(image.id)}
            disabled={image.status === 'processing'}
            className="rounded-lg bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {image.status === 'processing' ? 'Applying…' : hasResult ? 'Re-apply' : 'Apply watermark'}
          </button>
          {hasResult && (
            <button
              type="button"
              onClick={() => onDownload(image.id)}
              className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-emerald-300 hover:text-emerald-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-emerald-500 dark:hover:text-emerald-400"
            >
              Download
            </button>
          )}
          <button
            type="button"
            onClick={() => onRemove(image.id)}
            className="ml-auto rounded-lg px-2.5 py-1 text-xs font-medium text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-slate-500 dark:hover:bg-red-500/10 dark:hover:text-red-400"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  )
}
