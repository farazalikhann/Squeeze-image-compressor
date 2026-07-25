import { useRef, useState } from 'react'
import Cropper from 'react-easy-crop'
import type { Area, Point } from 'react-easy-crop'
import UploadZone from '../components/UploadZone'
import { formatBytes, formatDuration, stripExtension } from '../utils/format'
import { getImageDimensions } from '../utils/imageLoader'
import { cropImage } from '../utils/crop'
import { downloadSingle } from '../utils/download'
import type { CropArea, OutputFormat } from '../types'
import { FORMAT_EXT, FORMAT_LABELS } from '../types'

const ASPECTS: { label: string; value: number | undefined }[] = [
  { label: 'Free', value: undefined },
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '16:9', value: 16 / 9 },
  { label: '3:2', value: 3 / 2 },
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

interface CropOutput {
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

export default function CropPage() {
  const [image, setImage] = useState<LoadedImage | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState<string | undefined>()
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [aspect, setAspect] = useState<number | undefined>(undefined)
  const [cropPixels, setCropPixels] = useState<CropArea | null>(null)
  const [outputFormat, setOutputFormat] = useState<OutputFormat | 'keep'>('keep')
  const [result, setResult] = useState<CropOutput | null>(null)

  const imageRef = useRef(image)
  imageRef.current = image
  const resultRef = useRef(result)
  resultRef.current = result

  const naturalAspect = image && image.originalHeight > 0 ? image.originalWidth / image.originalHeight : 1
  const isProcessing = status === 'processing'

  const handleFiles = (files: File[]) => {
    const file = files[0]
    if (!file) return

    if (imageRef.current) URL.revokeObjectURL(imageRef.current.originalUrl)
    if (resultRef.current) URL.revokeObjectURL(resultRef.current.url)
    setResult(null)
    setErrorMessage(undefined)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setAspect(undefined)
    setCropPixels(null)

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

  const onCropComplete = (_: Area, croppedAreaPixels: Area) => {
    setCropPixels({
      x: Math.round(croppedAreaPixels.x),
      y: Math.round(croppedAreaPixels.y),
      width: Math.round(croppedAreaPixels.width),
      height: Math.round(croppedAreaPixels.height),
    })
  }

  const handleCrop = async () => {
    if (!image || !cropPixels) return
    setStatus('processing')
    setErrorMessage(undefined)
    try {
      const r = await cropImage(image.file, cropPixels, outputFormat)
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
      setErrorMessage(err instanceof Error ? err.message : 'Failed to crop image')
    }
  }

  const handleDownload = () => {
    if (!image || !result) return
    const base = stripExtension(image.fileName)
    const ext = FORMAT_EXT[result.format]
    downloadSingle({ fileName: `${base}-cropped.${ext}`, processedBlob: result.blob })
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Crop Image</h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500 dark:text-slate-400 sm:text-base">
          Drag and resize the crop box, pick an aspect ratio, and export the exact area you need.
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

      {image && (
        <div className="mb-6 flex animate-fade-in items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="min-w-0">
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
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Crop</h3>
            {cropPixels && (
              <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400">
                {cropPixels.width}×{cropPixels.height}
              </span>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {ASPECTS.map((a) => (
              <button
                key={a.label}
                type="button"
                onClick={() => setAspect(a.value)}
                className={`h-9 rounded-lg border px-3 text-xs font-medium transition-colors ${
                  aspect === a.value
                    ? 'border-indigo-500 bg-indigo-600 text-white'
                    : 'border-slate-200 text-slate-600 hover:border-indigo-300 dark:border-slate-700 dark:text-slate-300'
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>

          <div className="relative mt-3 h-64 w-full touch-none overflow-hidden rounded-xl bg-slate-900 sm:h-80">
            <Cropper
              image={image.originalUrl}
              crop={crop}
              zoom={zoom}
              aspect={aspect ?? naturalAspect}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>

          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-slate-400">Zoom</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="range-slider h-9 w-full"
            />
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
            onClick={handleCrop}
            disabled={isProcessing || !cropPixels}
            className="mt-5 flex h-11 w-full items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-6"
          >
            {isProcessing ? 'Cropping…' : result ? 'Crop again' : 'Crop image'}
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
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Cropped</h3>
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
                <img src={result.url} alt="Cropped" className="h-full w-full object-contain" />
              </div>
              <figcaption className="mt-1.5 text-center text-xs text-slate-500 dark:text-slate-400">
                Cropped · {result.width}×{result.height} · {formatBytes(result.size)}
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 text-center dark:bg-slate-800/60">
      <p className="text-xs text-slate-400 dark:text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-slate-700 dark:text-slate-200">{value}</p>
    </div>
  )
}
