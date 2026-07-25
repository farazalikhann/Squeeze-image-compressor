import { useState } from 'react'
import type { QueueImage } from '../types'
import { formatBytes, formatDuration, formatPercent } from '../utils/format'

interface Props {
  image: QueueImage
  onClose: () => void
}

export default function PreviewModal({ image, onClose }: Props) {
  const [sliderPos, setSliderPos] = useState(50)
  const [viewMode, setViewMode] = useState<'slider' | 'side'>('slider')
  const hasResult = image.status === 'done' && !!image.processedUrl

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-2 sm:p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5 dark:border-slate-800">
          <h2 className="truncate text-base font-semibold text-slate-800 dark:text-slate-100">{image.fileName}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
              <path d="M6 18 18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto p-4 sm:p-5">
          {hasResult && (
            <div className="mb-3 flex justify-center gap-1.5">
              <ViewToggleButton active={viewMode === 'slider'} onClick={() => setViewMode('slider')}>
                Slider
              </ViewToggleButton>
              <ViewToggleButton active={viewMode === 'side'} onClick={() => setViewMode('side')}>
                Side by side
              </ViewToggleButton>
            </div>
          )}

          {hasResult ? (
            viewMode === 'slider' ? (
              <div
                className="relative mx-auto max-h-[65vh] w-full select-none overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800"
                style={{ aspectRatio: `${image.originalWidth} / ${image.originalHeight}` }}
              >
                <img src={image.processedUrl} alt="Compressed" className="absolute inset-0 h-full w-full object-contain" draggable={false} />
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                >
                  <img
                    src={image.originalUrl}
                    alt="Original"
                    className="absolute inset-0 h-full w-full object-contain"
                    draggable={false}
                  />
                </div>

                <div
                  className="pointer-events-none absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className="pointer-events-none absolute top-1/2 left-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-slate-500">
                      <path
                        d="M8 7 4 12l4 5M16 7l4 5-4 5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>

                <input
                  type="range"
                  min={0}
                  max={100}
                  value={sliderPos}
                  onChange={(e) => setSliderPos(Number(e.target.value))}
                  className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
                  aria-label="Comparison slider"
                />

                <span className="pointer-events-none absolute left-2 top-2 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white">
                  Before
                </span>
                <span className="pointer-events-none absolute right-2 top-2 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white">
                  After
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <figure>
                  <div
                    className="mx-auto overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800"
                    style={{ aspectRatio: `${image.originalWidth} / ${image.originalHeight}` }}
                  >
                    <img src={image.originalUrl} alt="Original" className="h-full w-full object-contain" />
                  </div>
                  <figcaption className="mt-1.5 text-center text-xs text-slate-500 dark:text-slate-400">
                    Before · {formatBytes(image.originalSize)}
                  </figcaption>
                </figure>
                <figure>
                  <div
                    className="mx-auto overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800"
                    style={{ aspectRatio: `${image.originalWidth} / ${image.originalHeight}` }}
                  >
                    <img src={image.processedUrl} alt="Compressed" className="h-full w-full object-contain" />
                  </div>
                  <figcaption className="mt-1.5 text-center text-xs text-slate-500 dark:text-slate-400">
                    After · {formatBytes(image.processedSize!)}
                  </figcaption>
                </figure>
              </div>
            )
          ) : (
            <div className="mx-auto max-h-[65vh] overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
              <img src={image.originalUrl} alt={image.fileName} className="max-h-[65vh] w-full object-contain" />
            </div>
          )}

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
            <Stat label="Original size" value={formatBytes(image.originalSize)} />
            <Stat
              label="Compressed size"
              value={hasResult ? formatBytes(image.processedSize!) : '—'}
              highlight={hasResult}
            />
            <Stat
              label="Saved"
              value={hasResult ? `${formatPercent(image.originalSize, image.processedSize!)}%` : '—'}
              highlight={hasResult}
              positive
            />
            <Stat
              label="Time taken"
              value={hasResult && image.processingTimeMs != null ? formatDuration(image.processingTimeMs) : '—'}
              highlight={hasResult}
            />
            <Stat
              label="Dimensions"
              value={
                hasResult && image.processedWidth
                  ? `${image.processedWidth}×${image.processedHeight}`
                  : `${image.originalWidth}×${image.originalHeight}`
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function ViewToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-9 rounded-lg border px-3.5 text-sm font-medium transition-colors ${
        active
          ? 'border-indigo-500 bg-indigo-600 text-white'
          : 'border-slate-200 text-slate-600 hover:border-indigo-300 dark:border-slate-700 dark:text-slate-300'
      }`}
    >
      {children}
    </button>
  )
}

function Stat({
  label,
  value,
  highlight,
  positive,
}: {
  label: string
  value: string
  highlight?: boolean
  positive?: boolean
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 text-center dark:bg-slate-800/60">
      <p className="text-xs text-slate-400 dark:text-slate-500">{label}</p>
      <p
        className={`mt-0.5 text-sm font-semibold ${
          positive && highlight
            ? 'text-emerald-600 dark:text-emerald-400'
            : highlight
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-slate-700 dark:text-slate-200'
        }`}
      >
        {value}
      </p>
    </div>
  )
}
