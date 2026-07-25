import { formatBytes } from '../utils/format'

interface Totals {
  count: number
  originalTotal: number
  processedTotal: number
  savedBytes: number
  savedPercent: number
}

interface Props {
  totalImages: number
  selectedCount: number
  totals: Totals
  isProcessing: boolean
  onCompressSelected: () => void
  onDownloadAll: () => void
  onSelectAll: (selected: boolean) => void
  onClearAll: () => void
  onBatchRename: () => void
}

export default function DownloadBar({
  totalImages,
  selectedCount,
  totals,
  isProcessing,
  onCompressSelected,
  onDownloadAll,
  onSelectAll,
  onClearAll,
  onBatchRename,
}: Props) {
  const allSelected = totalImages > 0 && selectedCount === totalImages

  return (
    <div className="sticky bottom-0 z-30 border-t border-slate-200 bg-white/95 px-3 py-2.5 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/95 sm:px-6 sm:py-3">
      <div className="mx-auto flex max-w-5xl flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <label className="flex min-h-9 items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={(e) => onSelectAll(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 dark:border-slate-600"
            />
            {selectedCount}/{totalImages} selected
          </label>

          <button
            onClick={onBatchRename}
            className="min-h-9 text-sm font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
          >
            Rename
          </button>

          <button
            onClick={onClearAll}
            className="min-h-9 text-sm font-medium text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
          >
            Clear all
          </button>

          {totals.count > 0 && (
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
              Saved {totals.savedPercent.toFixed(1)}%
            </span>
          )}
        </div>

        {totals.count > 0 && (
          <div className="hidden items-center gap-2 text-sm md:flex">
            <span className="text-slate-500 dark:text-slate-400">
              {formatBytes(totals.originalTotal)} → {formatBytes(totals.processedTotal)}
            </span>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
              Saved {formatBytes(totals.savedBytes)} ({totals.savedPercent.toFixed(1)}%)
            </span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={onCompressSelected}
            disabled={selectedCount === 0 || isProcessing}
            className="min-h-11 flex-1 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-initial"
          >
            {isProcessing ? 'Compressing…' : `Compress ${selectedCount > 0 ? `(${selectedCount})` : ''}`}
          </button>
          <button
            onClick={onDownloadAll}
            disabled={totals.count === 0}
            className="min-h-11 flex-1 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-initial"
          >
            Download All (ZIP)
          </button>
        </div>
      </div>
    </div>
  )
}
