import { useMemo, useState } from 'react'
import Cropper from 'react-easy-crop'
import type { Area, Point } from 'react-easy-crop'
import type { ImageEdits, OutputFormat, QueueImage } from '../types'
import { DEFAULT_EDITS, FORMAT_LABELS } from '../types'
import { formatBytes } from '../utils/format'
import { RotateLeftIcon, RotateRightIcon, FlipHIcon, FlipVIcon } from './RotateFlipIcons'

interface Props {
  image: QueueImage
  onClose: () => void
  onSave: (id: string, edits: ImageEdits, fileName: string) => void
}

const ASPECTS: { label: string; value: number | undefined }[] = [
  { label: 'Free', value: undefined },
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '16:9', value: 16 / 9 },
  { label: '9:16', value: 9 / 16 },
]

const FORMAT_OPTIONS: OutputFormat[] = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

export default function EditToolbar({ image, onClose, onSave }: Props) {
  const [edits, setEdits] = useState<ImageEdits>(() => ({
    ...image.edits,
    resize: { ...image.edits.resize },
  }))
  const [fileName, setFileName] = useState(image.fileName)

  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [aspect, setAspect] = useState<number | undefined>(undefined)
  const [cropEnabled, setCropEnabled] = useState(!!image.edits.crop)

  const naturalAspect = useMemo(
    () => (image.originalWidth && image.originalHeight ? image.originalWidth / image.originalHeight : 1),
    [image.originalWidth, image.originalHeight],
  )

  const onCropComplete = (_: Area, croppedAreaPixels: Area) => {
    setEdits((prev) => ({
      ...prev,
      crop: {
        x: Math.round(croppedAreaPixels.x),
        y: Math.round(croppedAreaPixels.y),
        width: Math.round(croppedAreaPixels.width),
        height: Math.round(croppedAreaPixels.height),
      },
    }))
  }

  const rotateBy = (delta: 90 | -90) => {
    setEdits((prev) => ({ ...prev, rotate: (((prev.rotate + delta + 360) % 360) as ImageEdits['rotate']) }))
  }

  const toggleFlip = (axis: 'flipH' | 'flipV') => {
    setEdits((prev) => ({ ...prev, [axis]: !prev[axis] }))
  }

  const previewTransform = `rotate(${edits.rotate}deg) scaleX(${edits.flipH ? -1 : 1}) scaleY(${
    edits.flipV ? -1 : 1
  })`

  const resetAll = () => {
    setEdits({ ...DEFAULT_EDITS, resize: { ...DEFAULT_EDITS.resize } })
    setCropEnabled(false)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setAspect(undefined)
  }

  const handleSave = () => {
    onSave(image.id, cropEnabled ? edits : { ...edits, crop: null }, fileName.trim() || image.fileName)
  }

  const setResizeWidth = (value: string) => {
    const num = value === '' ? '' : Number(value)
    setEdits((prev) => {
      const width = num
      let height = prev.resize.height
      if (prev.resize.keepAspect && typeof width === 'number' && width > 0) {
        height = Math.round(width / naturalAspect)
      }
      return { ...prev, resize: { ...prev.resize, width, height } }
    })
  }

  const setResizeHeight = (value: string) => {
    const num = value === '' ? '' : Number(value)
    setEdits((prev) => {
      const height = num
      let width = prev.resize.width
      if (prev.resize.keepAspect && typeof height === 'number' && height > 0) {
        width = Math.round(height * naturalAspect)
      }
      return { ...prev, resize: { ...prev.resize, width, height } }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5 dark:border-slate-800">
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Edit image</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* Filename */}
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">File name</label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Crop */}
          <div className="mt-5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Crop</label>
              <label className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={cropEnabled}
                  onChange={(e) => setCropEnabled(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 dark:border-slate-600"
                />
                Enable crop
              </label>
            </div>

            {cropEnabled && (
              <>
                <div className="relative mt-2 h-64 w-full overflow-hidden rounded-xl bg-slate-900 sm:h-80">
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
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {ASPECTS.map((a) => (
                    <button
                      key={a.label}
                      type="button"
                      onClick={() => setAspect(a.value)}
                      className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                        aspect === a.value
                          ? 'border-indigo-500 bg-indigo-600 text-white'
                          : 'border-slate-200 text-slate-600 hover:border-indigo-300 dark:border-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {a.label}
                    </button>
                  ))}
                  <div className="ml-auto flex items-center gap-2">
                    <span className="text-xs text-slate-400">Zoom</span>
                    <input
                      type="range"
                      min={1}
                      max={3}
                      step={0.05}
                      value={zoom}
                      onChange={(e) => setZoom(Number(e.target.value))}
                      className="range-slider w-24"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Transform */}
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-[auto_1fr]">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
              <img
                src={image.originalUrl}
                alt=""
                className="h-16 w-16 object-cover transition-transform"
                style={{ transform: previewTransform }}
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Rotate & flip</label>
              <div className="mt-1.5 flex flex-wrap gap-2">
                <ToolButton onClick={() => rotateBy(-90)} label="Rotate left">
                  <RotateLeftIcon />
                </ToolButton>
                <ToolButton onClick={() => rotateBy(90)} label="Rotate right">
                  <RotateRightIcon />
                </ToolButton>
                <ToolButton onClick={() => toggleFlip('flipH')} label="Flip horizontal" active={edits.flipH}>
                  <FlipHIcon />
                </ToolButton>
                <ToolButton onClick={() => toggleFlip('flipV')} label="Flip vertical" active={edits.flipV}>
                  <FlipVIcon />
                </ToolButton>
              </div>
            </div>
          </div>

          {/* Resize */}
          <div className="mt-5">
            <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={edits.resize.enabled}
                onChange={(e) =>
                  setEdits((prev) => ({ ...prev, resize: { ...prev.resize, enabled: e.target.checked } }))
                }
                className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 dark:border-slate-600"
              />
              Resize
            </label>
            {edits.resize.enabled && (
              <div className="mt-2 flex flex-wrap items-end gap-3">
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400">Width (px)</label>
                  <input
                    type="number"
                    min={1}
                    value={edits.resize.width}
                    onChange={(e) => setResizeWidth(e.target.value)}
                    className="mt-1 block w-24 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400">Height (px)</label>
                  <input
                    type="number"
                    min={1}
                    value={edits.resize.height}
                    onChange={(e) => setResizeHeight(e.target.value)}
                    className="mt-1 block w-24 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <input
                    type="checkbox"
                    checked={edits.resize.keepAspect}
                    onChange={(e) =>
                      setEdits((prev) => ({ ...prev, resize: { ...prev.resize, keepAspect: e.target.checked } }))
                    }
                    className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 dark:border-slate-600"
                  />
                  Keep aspect ratio
                </label>
              </div>
            )}
          </div>

          {/* Format override */}
          <div className="mt-5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Output format for this image
            </label>
            <div className="mt-1.5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setEdits((prev) => ({ ...prev, formatOverride: null }))}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                  edits.formatOverride === null
                    ? 'border-indigo-500 bg-indigo-600 text-white'
                    : 'border-slate-200 text-slate-600 hover:border-indigo-300 dark:border-slate-700 dark:text-slate-300'
                }`}
              >
                Use global setting
              </button>
              {FORMAT_OPTIONS.map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setEdits((prev) => ({ ...prev, formatOverride: fmt }))}
                  className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                    edits.formatOverride === fmt
                      ? 'border-indigo-500 bg-indigo-600 text-white'
                      : 'border-slate-200 text-slate-600 hover:border-indigo-300 dark:border-slate-700 dark:text-slate-300'
                  }`}
                >
                  {FORMAT_LABELS[fmt]}
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="mt-5 rounded-xl bg-slate-50 p-3.5 text-xs dark:bg-slate-800/60">
            <div className="grid grid-cols-2 gap-y-1.5 text-slate-600 dark:text-slate-300 sm:grid-cols-4">
              <span className="text-slate-400 dark:text-slate-500">Dimensions</span>
              <span className="font-medium">
                {image.originalWidth}×{image.originalHeight}
              </span>
              <span className="text-slate-400 dark:text-slate-500">File size</span>
              <span className="font-medium">{formatBytes(image.originalSize)}</span>
            </div>
            <p className="mt-2.5 flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
              <LockIcon /> EXIF & location metadata is automatically stripped when processed
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-5 py-3.5 dark:border-slate-800">
          <button
            onClick={resetAll}
            className="text-xs font-medium text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
          >
            Reset all edits
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Save & compress
            </button>
          </div>
        </div>
      </div>
    </div>
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
      className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
        active
          ? 'border-indigo-500 bg-indigo-600 text-white'
          : 'border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-500'
      }`}
    >
      {children}
    </button>
  )
}

function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path d="M6 18 18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
function LockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 shrink-0">
      <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 11V7a4 4 0 1 1 8 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
