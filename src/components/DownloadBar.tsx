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
}

export default function DownloadBar({
  totalImages,
  selectedCount,
  totals,
  isProcessing,
  onCompressSelected,
  onDownloadAll,
  onSelectAll,
}: Props) {
  const allSelected = totalImages > 0 && selectedCount === totalImages

  return (
    <div className="sticky bottom-0 z-30 border-t border-slate-200 bg-white/95 px-3 py-2 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/95 sm:px-6 sm:py-3">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 sm:flex-wrap">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <label className="flex h-9 shrink-0 items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 sm:h-auto sm:text-sm">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={(e) => onSelectAll(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 dark:border-slate-600"
            />
            <span className="whitespace-nowrap">
              {selectedCount}/{totalImages}
            </span>
          </label>

          {totals.count > 0 && (
            <span className="shrink-0 whitespace-nowrap rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 sm:px-2.5 sm:py-1 sm:text-xs">
              Saved {totals.savedPercent.toFixed(1)}%
            </span>
          )}

          {totals.count > 0 && (
            <span className="hidden truncate text-sm text-slate-500 dark:text-slate-400 md:inline">
              {formatBytes(totals.originalTotal)} → {formatBytes(totals.processedTotal)}
            </span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            onClick={onCompressSelected}
            disabled={selectedCount === 0 || isProcessing}
            className="h-9 rounded-lg bg-indigo-600 px-3 text-xs font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 sm:h-11 sm:px-4 sm:text-sm"
          >
            {isProcessing ? 'Compressing…' : `Compress${selectedCount > 0 ? ` (${selectedCount})` : ''}`}
          </button>
          <button
            onClick={onDownloadAll}
            disabled={totals.count === 0}
            className="h-9 rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 sm:h-11 sm:px-4 sm:text-sm"
          >
            <span className="sm:hidden">ZIP</span>
            <span className="hidden sm:inline">Download All (ZIP)</span>
          </button>
        </div>
      </div>
    </div>
  )
}
