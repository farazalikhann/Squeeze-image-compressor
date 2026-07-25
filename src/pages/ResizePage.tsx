import { useRef, useState } from 'react'
import UploadZone from '../components/UploadZone'
import PreviewModal from '../components/PreviewModal'
import FaqSection from '../components/FaqSection'
import { formatBytes, formatDuration, stripExtension } from '../utils/format'
import { getImageDimensions } from '../utils/imageLoader'
import { resizeImage } from '../utils/resize'
import { downloadSingle } from '../utils/download'
import type { OutputFormat, QueueStatus } from '../types'
import { FORMAT_EXT, FORMAT_LABELS } from '../types'
import { SEO_CONTENT } from '../lib/seoContent'

const seo = SEO_CONTENT.resize

const PRESETS: { label: string; width: number; height: number }[] = [
  { label: '1920×1080', width: 1920, height: 1080 },
  { label: '1080×1080', width: 1080, height: 1080 },
  { label: '800×600', width: 800, height: 600 },
]

const FORMAT_OPTIONS: OutputFormat[] = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

interface LoadedImage {
  file: File
  originalUrl: string
  originalSize: number
  originalWidth: number
  originalHeight: number
  fileName: string
}

interface ResizeOutput {
  url: string
  blob: Blob
  size: number
  width: number
  height: number
  format: OutputFormat
  formatFellBack: boolean
  timeMs: number
}

type Status = 'idle' | 'reading' | 'ready' | 'processing' | 'done' | 'error'

export default function ResizePage() {
  const [image, setImage] = useState<LoadedImage | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState<string | undefined>()
  const [width, setWidth] = useState<number | ''>('')
  const [height, setHeight] = useState<number | ''>('')
  const [lockAspect, setLockAspect] = useState(true)
  const [outputFormat, setOutputFormat] = useState<OutputFormat | 'keep'>('keep')
  const [result, setResult] = useState<ResizeOutput | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const imageRef = useRef(image)
  imageRef.current = image
  const resultRef = useRef(result)
  resultRef.current = result

  const naturalAspect = image && image.originalHeight > 0 ? image.originalWidth / image.originalHeight : 1

  const resetToEmpty = () => {
    if (imageRef.current) URL.revokeObjectURL(imageRef.current.originalUrl)
    if (resultRef.current) URL.revokeObjectURL(resultRef.current.url)
    setImage(null)
    setResult(null)
    setStatus('idle')
    setErrorMessage(undefined)
    setWidth('')
    setHeight('')
  }

  const handleFiles = (files: File[]) => {
    const file = files[0]
    if (!file) return

    if (imageRef.current) URL.revokeObjectURL(imageRef.current.originalUrl)
    if (resultRef.current) URL.revokeObjectURL(resultRef.current.url)
    setResult(null)
    setErrorMessage(undefined)

    const originalUrl = URL.createObjectURL(file)
    setImage({ file, originalUrl, originalSize: file.size, originalWidth: 0, originalHeight: 0, fileName: file.name })
    setStatus('reading')

    getImageDimensions(file)
      .then(({ width: w, height: h }) => {
        setImage((prev) => (prev ? { ...prev, originalWidth: w, originalHeight: h } : prev))
        setWidth(w)
        setHeight(h)
        setStatus('ready')
      })
      .catch(() => {
        setStatus('error')
        setErrorMessage('Could not read this image')
      })
  }

  const setWidthLocked = (value: string) => {
    const num = value === '' ? '' : Math.max(1, Math.round(Number(value)))
    setWidth(num)
    if (lockAspect && typeof num === 'number' && num > 0) {
      setHeight(Math.max(1, Math.round(num / naturalAspect)))
    }
  }

  const setHeightLocked = (value: string) => {
    const num = value === '' ? '' : Math.max(1, Math.round(Number(value)))
    setHeight(num)
    if (lockAspect && typeof num === 'number' && num > 0) {
      setWidth(Math.max(1, Math.round(num * naturalAspect)))
    }
  }

  const applyPreset = (w: number, h: number) => {
    setWidth(w)
    setHeight(h)
  }

  const handleResize = async () => {
    if (!image || typeof width !== 'number' || typeof height !== 'number' || width < 1 || height < 1) return
    setStatus('processing')
    setErrorMessage(undefined)
    try {
      const r = await resizeImage(image.file, width, height, outputFormat)
      if (resultRef.current) URL.revokeObjectURL(resultRef.current.url)
      const url = URL.createObjectURL(r.blob)
      setResult({
        url,
        blob: r.blob,
        size: r.blob.size,
        width: r.width,
        height: r.height,
        format: r.format,
        formatFellBack: r.formatFellBack,
        timeMs: r.timeMs,
      })
      setStatus('done')
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Failed to resize image')
    }
  }

  const handleDownload = () => {
    if (!image || !result) return
    const base = stripExtension(image.fileName)
    const ext = FORMAT_EXT[result.format]
    downloadSingle({ fileName: `${base}-resized.${ext}`, processedBlob: result.blob })
  }

  const isProcessing = status === 'processing'
  const previewStatus: QueueStatus = result ? 'done' : status === 'processing' ? 'processing' : status === 'error' ? 'error' : 'pending'
  const previewImage = image
    ? {
        fileName: image.fileName,
        status: previewStatus,
        originalUrl: image.originalUrl,
        processedUrl: result?.url,
        originalWidth: image.originalWidth,
        originalHeight: image.originalHeight,
        processedWidth: result?.width,
        processedHeight: result?.height,
        originalSize: image.originalSize,
        processedSize: result?.size,
        processingTimeMs: result?.timeMs,
      }
    : null

  return (
    <>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">{seo.h1}</h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500 dark:text-slate-400 sm:text-base">{seo.intro}</p>
          <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20">
            🔒 Processed locally in your browser. No uploads.
          </span>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
            <span className="text-xs text-slate-400 dark:text-slate-500">Supports</span>
            {['JPG', 'PNG', 'WebP', 'AVIF'].map((fmt) => (
              <span
                key={fmt}
                className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
              >
                {fmt}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <UploadZone onFiles={handleFiles} currentCount={image ? 1 : 0} />
        </div>

        {status === 'error' && errorMessage && !image?.originalWidth && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
            {errorMessage}
          </div>
        )}

        {image && (
          <div className="mb-6 flex animate-fade-in items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800"
            >
              <img src={result?.url ?? image.originalUrl} alt={image.fileName} className="h-full w-full object-cover" />
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100" title={image.fileName}>
                {image.fileName}
              </p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {image.originalWidth > 0 ? `${image.originalWidth}×${image.originalHeight}` : 'Reading…'} ·{' '}
                {formatBytes(image.originalSize)}
              </p>
            </div>
            <button
              type="button"
              onClick={resetToEmpty}
              className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-slate-500 dark:hover:bg-red-500/10 dark:hover:text-red-400"
            >
              Remove
            </button>
          </div>
        )}

        {image && image.originalWidth > 0 && (
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Resize</h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Original {image.originalWidth}×{image.originalHeight}
              {typeof width === 'number' && typeof height === 'number' && (
                <>
                  {' '}
                  → target {width}×{height}
                </>
              )}
            </p>

            <div className="mt-4 flex flex-wrap items-end gap-3">
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400">Width (px)</label>
                <input
                  type="number"
                  min={1}
                  inputMode="numeric"
                  value={width}
                  onChange={(e) => setWidthLocked(e.target.value)}
                  className="mt-1 block h-10 w-24 rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
              <span className="mb-2.5 text-slate-400">×</span>
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400">Height (px)</label>
                <input
                  type="number"
                  min={1}
                  inputMode="numeric"
                  value={height}
                  onChange={(e) => setHeightLocked(e.target.value)}
                  className="mt-1 block h-10 w-24 rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
              <label className="mb-2.5 flex h-10 items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={lockAspect}
                  onChange={(e) => setLockAspect(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 dark:border-slate-600"
                />
                Lock aspect ratio
              </label>
            </div>

            <div className="mt-4">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Presets</span>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => applyPreset(p.width, p.height)}
                    className="h-9 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-600 transition-colors hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Output format</span>
              <div className="mt-1.5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setOutputFormat('keep')}
                  className={`h-9 rounded-lg border px-3 text-xs font-medium transition-colors ${
                    outputFormat === 'keep'
                      ? 'border-indigo-500 bg-indigo-600 text-white'
                      : 'border-slate-200 text-slate-600 hover:border-indigo-300 dark:border-slate-700 dark:text-slate-300'
                  }`}
                >
                  Keep original
                </button>
                {FORMAT_OPTIONS.map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setOutputFormat(fmt)}
                    className={`h-9 rounded-lg border px-3 text-xs font-medium transition-colors ${
                      outputFormat === fmt
                        ? 'border-indigo-500 bg-indigo-600 text-white'
                        : 'border-slate-200 text-slate-600 hover:border-indigo-300 dark:border-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {FORMAT_LABELS[fmt]}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleResize}
              disabled={isProcessing || typeof width !== 'number' || typeof height !== 'number'}
              className="mt-5 flex h-11 w-full items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-6"
            >
              {isProcessing ? 'Resizing…' : result ? 'Resize again' : 'Resize image'}
            </button>

            {status === 'error' && errorMessage && (
              <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                {errorMessage}
              </p>
            )}
          </div>
        )}

        {result && image && (
          <div className="animate-fade-in rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 animate-success-pop items-center justify-center rounded-full bg-emerald-500 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
                  <path
                    d="M5 13l4 4L19 7"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="animate-check-draw"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Resized</h3>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <figure>
                <div
                  className="overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800"
                  style={{ aspectRatio: `${image.originalWidth} / ${image.originalHeight}` }}
                >
                  <img src={image.originalUrl} alt="Original" className="h-full w-full object-contain" />
                </div>
                <figcaption className="mt-1.5 text-center text-xs text-slate-500 dark:text-slate-400">
                  Original · {image.originalWidth}×{image.originalHeight} · {formatBytes(image.originalSize)}
                </figcaption>
              </figure>
              <figure>
                <div
                  className="overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800"
                  style={{ aspectRatio: `${result.width} / ${result.height}` }}
                >
                  <img src={result.url} alt="Resized" className="h-full w-full object-contain" />
                </div>
                <figcaption className="mt-1.5 text-center text-xs text-slate-500 dark:text-slate-400">
                  Resized · {result.width}×{result.height} · {formatBytes(result.size)}
                </figcaption>
              </figure>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="New dimensions" value={`${result.width}×${result.height}`} />
              <Stat label="New size" value={formatBytes(result.size)} />
              <Stat label="Format" value={result.format.replace('image/', '').toUpperCase()} />
              <Stat label="Time taken" value={formatDuration(result.timeMs)} />
            </div>

            {result.formatFellBack && (
              <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                Your browser can't encode this format here, so we used {result.format.replace('image/', '').toUpperCase()}{' '}
                instead.
              </p>
            )}

            <button
              type="button"
              onClick={handleDownload}
              className="mt-5 flex h-11 w-full items-center justify-center rounded-lg bg-emerald-600 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 sm:w-auto sm:px-6"
            >
              Download
            </button>
          </div>
        )}

        <FaqSection items={seo.faqs} />
      </main>

      {showPreview && previewImage && <PreviewModal image={previewImage} onClose={() => setShowPreview(false)} />}
    </>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 text-center dark:bg-slate-800/60">
      <p className="text-xs text-slate-400 dark:text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-slate-700 dark:text-slate-200">{value}</p>
    </div>
  )
}
