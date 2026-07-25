import { useRef, useState } from 'react'
import UploadZone from '../components/UploadZone'
import { RotateLeftIcon, RotateRightIcon, FlipHIcon, FlipVIcon } from '../components/RotateFlipIcons'
import { formatBytes, formatDuration, stripExtension } from '../utils/format'
import { getImageDimensions } from '../utils/imageLoader'
import { rotateFlipImage } from '../utils/rotateFlip'
import { downloadSingle } from '../utils/download'
import type { OutputFormat } from '../types'
import { FORMAT_EXT, FORMAT_LABELS } from '../types'

type RotateDeg = 0 | 90 | 180 | 270
const FORMAT_OPTIONS: OutputFormat[] = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

interface LoadedImage {
  file: File
  originalUrl: string
  originalSize: number
  originalWidth: number
  originalHeight: number
  fileName: string
}

interface RotateOutput {
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

export default function RotatePage() {
  const [image, setImage] = useState<LoadedImage | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState<string | undefined>()
  const [rotate, setRotate] = useState<RotateDeg>(0)
  const [flipH, setFlipH] = useState(false)
  const [flipV, setFlipV] = useState(false)
  const [outputFormat, setOutputFormat] = useState<OutputFormat | 'keep'>('keep')
  const [result, setResult] = useState<RotateOutput | null>(null)

  const imageRef = useRef(image)
  imageRef.current = image
  const resultRef = useRef(result)
  resultRef.current = result

  const isProcessing = status === 'processing'
  const isSwapped = rotate === 90 || rotate === 270
  const previewTransform = `rotate(${rotate}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`

  const handleFiles = (files: File[]) => {
    const file = files[0]
    if (!file) return

    if (imageRef.current) URL.revokeObjectURL(imageRef.current.originalUrl)
    if (resultRef.current) URL.revokeObjectURL(resultRef.current.url)
    setResult(null)
    setErrorMessage(undefined)
    setRotate(0)
    setFlipH(false)
    setFlipV(false)

    const originalUrl = URL.createObjectURL(file)
    setImage({ file, originalUrl, originalSize: file.size, originalWidth: 0, originalHeight: 0, fileName: file.name })
    setStatus('reading')

    getImageDimensions(file)
      .then(({ width, height }) => {
        setImage((prev) => (prev ? { ...prev, originalWidth: width, originalHeight: height } : prev))
        setStatus('ready')
      })
      .catch(() => {
        setStatus('error')
        setErrorMessage('Could not read this image')
      })
  }

  const resetToEmpty = () => {
    if (imageRef.current) URL.revokeObjectURL(imageRef.current.originalUrl)
    if (resultRef.current) URL.revokeObjectURL(resultRef.current.url)
    setImage(null)
    setResult(null)
    setStatus('idle')
    setErrorMessage(undefined)
  }

  const rotateBy = (delta: 90 | -90) => setRotate((prev) => (((prev + delta + 360) % 360) as RotateDeg))
  const rotate180 = () => setRotate((prev) => (((prev + 180) % 360) as RotateDeg))

  const handleApply = async () => {
    if (!image) return
    setStatus('processing')
    setErrorMessage(undefined)
    try {
      const r = await rotateFlipImage(image.file, rotate, flipH, flipV, outputFormat)
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
      setErrorMessage(err instanceof Error ? err.message : 'Failed to rotate image')
    }
  }

  const handleDownload = () => {
    if (!image || !result) return
    const base = stripExtension(image.fileName)
    const ext = FORMAT_EXT[result.format]
    downloadSingle({ fileName: `${base}-rotated.${ext}`, processedBlob: result.blob })
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Rotate & Flip</h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500 dark:text-slate-400 sm:text-base">
          Rotate in 90° steps or flip horizontally and vertically, with a live preview.
        </p>
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

      {image && image.originalWidth > 0 && (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100" title={image.fileName}>
                {image.fileName}
              </p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {isSwapped ? `${image.originalWidth}×${image.originalHeight} → ${image.originalHeight}×${image.originalWidth}` : `${image.originalWidth}×${image.originalHeight}`}{' '}
                · {formatBytes(image.originalSize)}
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

          <div className="mx-auto mt-4 flex h-56 w-56 items-center justify-center overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 sm:h-64 sm:w-64">
            <img
              src={image.originalUrl}
              alt="Preview"
              className="h-full w-full object-contain transition-transform duration-200"
              style={{ transform: previewTransform }}
            />
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <ToolButton onClick={() => rotateBy(-90)} label="Rotate left">
              <RotateLeftIcon />
            </ToolButton>
            <ToolButton onClick={() => rotateBy(90)} label="Rotate right">
              <RotateRightIcon />
            </ToolButton>
            <ToolButton onClick={rotate180} label="Rotate 180°">
              <span className="text-xs font-bold">180°</span>
            </ToolButton>
            <ToolButton onClick={() => setFlipH((v) => !v)} label="Flip horizontal" active={flipH}>
              <FlipHIcon />
            </ToolButton>
            <ToolButton onClick={() => setFlipV((v) => !v)} label="Flip vertical" active={flipV}>
              <FlipVIcon />
            </ToolButton>
          </div>

          <div className="mt-5">
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
            onClick={handleApply}
            disabled={isProcessing}
            className="mt-5 flex h-11 w-full items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-6"
          >
            {isProcessing ? 'Applying…' : result ? 'Apply again' : 'Apply changes'}
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
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Done</h3>
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
                <img src={result.url} alt="Rotated" className="h-full w-full object-contain" />
              </div>
              <figcaption className="mt-1.5 text-center text-xs text-slate-500 dark:text-slate-400">
                Result · {result.width}×{result.height} · {formatBytes(result.size)}
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
    </main>
  )
}

function ToolButton({
  onClick,
  label,
  active,
  children,
}: {
  onClick: () => void
  label: string
  active?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`flex h-11 w-11 items-center justify-center rounded-lg border transition-colors ${
        active
          ? 'border-indigo-500 bg-indigo-600 text-white'
          : 'border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-500'
      }`}
    >
      {children}
    </button>
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
