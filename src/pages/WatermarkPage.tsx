import { useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import UploadZone from '../components/UploadZone'
import WatermarkCard from '../components/WatermarkCard'
import PreviewModal from '../components/PreviewModal'
import DownloadBar from '../components/DownloadBar'
import { useWatermarkQueue } from '../hooks/useWatermarkQueue'
import { downloadAllAsZip, downloadSingle } from '../utils/download'
import { loadImageBitmap } from '../utils/imageLoader'
import type { WatermarkPosition, WatermarkSettings } from '../utils/watermark'
import type { OutputFormat } from '../types'
import { FORMAT_LABELS } from '../types'

const POSITIONS: WatermarkPosition[] = [
  'top-left',
  'top-center',
  'top-right',
  'middle-left',
  'center',
  'middle-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
]

const FORMAT_OPTIONS: OutputFormat[] = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

function overlayPositionStyle(position: WatermarkPosition): CSSProperties {
  const pad = '4%'
  const style: CSSProperties = { position: 'absolute' }

  if (position.startsWith('top')) style.top = pad
  else if (position.startsWith('bottom')) style.bottom = pad
  else style.top = '50%'

  if (position.endsWith('left')) style.left = pad
  else if (position.endsWith('right')) style.right = pad
  else style.left = '50%'

  const tx = position.endsWith('left') || position.endsWith('right') ? '0' : '-50%'
  const ty = position.startsWith('top') || position.startsWith('bottom') ? '0' : '-50%'
  if (tx !== '0' || ty !== '0') style.transform = `translate(${tx}, ${ty})`

  return style
}

export default function WatermarkPage() {
  const {
    images,
    rejectedFiles,
    clearRejected,
    addFiles,
    removeImage,
    clearAll,
    toggleSelected,
    selectAll,
    processImage,
    processMany,
    totals,
  } = useWatermarkQueue()

  const [mode, setMode] = useState<'text' | 'logo'>('text')
  const [text, setText] = useState('Squeeze')
  const [fontSize, setFontSize] = useState(32)
  const [color, setColor] = useState('#ffffff')
  const [opacity, setOpacity] = useState(0.6)
  const [position, setPosition] = useState<WatermarkPosition>('bottom-right')
  const [outputFormat, setOutputFormat] = useState<OutputFormat | 'keep'>('keep')
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoBitmap, setLogoBitmap] = useState<ImageBitmap | null>(null)
  const [logoError, setLogoError] = useState<string | undefined>()
  const [previewId, setPreviewId] = useState<string | null>(null)

  const logoInputRef = useRef<HTMLInputElement>(null)

  const isProcessing = images.some((img) => img.status === 'processing')
  const selectedCount = images.filter((img) => img.selected).length
  const settledCount = images.filter((img) => img.status === 'done' || img.status === 'error').length
  const progressPercent = images.length > 0 ? Math.round((settledCount / images.length) * 100) : 0
  const previewImage = useMemo(() => images.find((img) => img.id === previewId) ?? null, [images, previewId])
  const previewTarget = images[0]

  const settings: WatermarkSettings = {
    mode,
    text,
    fontSize,
    color,
    opacity,
    position,
    logoBitmap,
    outputFormat,
  }

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setLogoError(undefined)
    try {
      const { bitmap } = await loadImageBitmap(file)
      setLogoBitmap(bitmap)
      setLogoUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return URL.createObjectURL(file)
      })
    } catch {
      setLogoError('Could not read this logo image')
    }
  }

  const canApply = mode === 'text' ? text.trim().length > 0 : !!logoBitmap

  const handleApplySelected = () => {
    if (!canApply) return
    const ids = images.filter((img) => img.selected).map((img) => img.id)
    if (ids.length > 0) void processMany(ids, settings)
  }

  const handleDownloadAll = () => {
    const done = images.filter((img) => img.status === 'done' && img.processedBlob)
    if (done.length > 0) void downloadAllAsZip(done, 'watermarked-images.zip')
  }

  return (
    <>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Watermark</h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500 dark:text-slate-400 sm:text-base">
            Stamp a text or logo watermark onto up to 100 images at once. Everything happens on your device.
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

        {rejectedFiles.length > 0 && (
          <div className="mb-4 flex items-start justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
            <p>
              {rejectedFiles.length} file(s) were skipped (unsupported type or over the 100-image limit):{' '}
              <span className="font-medium">{rejectedFiles.slice(0, 5).join(', ')}</span>
              {rejectedFiles.length > 5 && ` +${rejectedFiles.length - 5} more`}
            </p>
            <button onClick={clearRejected} className="shrink-0 font-medium text-amber-600 hover:underline dark:text-amber-400">
              Dismiss
            </button>
          </div>
        )}

        <div className="mb-6">
          <UploadZone onFiles={addFiles} currentCount={images.length} />
        </div>

        {images.length > 0 && (
          <>
            <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Watermark</h3>

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setMode('text')}
                  className={`h-9 flex-1 rounded-lg border text-sm font-medium transition-colors sm:flex-initial sm:px-6 ${
                    mode === 'text'
                      ? 'border-indigo-500 bg-indigo-600 text-white'
                      : 'border-slate-200 text-slate-600 hover:border-indigo-300 dark:border-slate-700 dark:text-slate-300'
                  }`}
                >
                  Text
                </button>
                <button
                  type="button"
                  onClick={() => setMode('logo')}
                  className={`h-9 flex-1 rounded-lg border text-sm font-medium transition-colors sm:flex-initial sm:px-6 ${
                    mode === 'logo'
                      ? 'border-indigo-500 bg-indigo-600 text-white'
                      : 'border-slate-200 text-slate-600 hover:border-indigo-300 dark:border-slate-700 dark:text-slate-300'
                  }`}
                >
                  Logo / Image
                </button>
              </div>

              {mode === 'text' ? (
                <div key="text-mode" className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Watermark text</label>
                    <input
                      type="text"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="© Your Name"
                      className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Font size — {fontSize}px
                    </label>
                    <input
                      type="range"
                      min={12}
                      max={120}
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="range-slider mt-2.5 h-9 w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Color</label>
                    <div className="mt-1.5 flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 dark:border-slate-700 dark:bg-slate-800">
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="h-8 w-10 cursor-pointer rounded border-none bg-transparent"
                      />
                      <span className="text-sm text-slate-500 dark:text-slate-400">{color}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div key="logo-mode" className="mt-4">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Logo image</label>
                  <div className="mt-1.5 flex items-center gap-3">
                    {logoUrl && (
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                        <img src={logoUrl} alt="Logo" className="h-full w-full object-contain" />
                      </div>
                    )}
                    <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-600 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300"
                    >
                      {logoUrl ? 'Change logo' : 'Choose logo'}
                    </button>
                  </div>
                  {logoError && <p className="mt-2 text-xs font-medium text-amber-600 dark:text-amber-400">{logoError}</p>}
                </div>
              )}

              <div className="mt-4">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Opacity — {Math.round(opacity * 100)}%
                </label>
                <input
                  type="range"
                  min={0.05}
                  max={1}
                  step={0.05}
                  value={opacity}
                  onChange={(e) => setOpacity(Number(e.target.value))}
                  className="range-slider mt-2.5 h-9 w-full"
                />
              </div>

              <div className="mt-4">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Position</span>
                <div className="mt-1.5 grid w-max grid-cols-3 gap-1.5">
                  {POSITIONS.map((pos) => (
                    <button
                      key={pos}
                      type="button"
                      aria-label={pos}
                      title={pos}
                      onClick={() => setPosition(pos)}
                      className={`flex h-10 w-10 items-center justify-center rounded-lg border transition-colors ${
                        position === pos
                          ? 'border-indigo-500 bg-indigo-600'
                          : 'border-slate-200 bg-slate-50 hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-800'
                      }`}
                    >
                      <span className={`h-2 w-2 rounded-full ${position === pos ? 'bg-white' : 'bg-slate-400 dark:bg-slate-500'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {previewTarget && (
                <div className="mt-4">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Live preview</span>
                  <div className="relative mt-1.5 max-h-72 w-full overflow-hidden rounded-xl bg-slate-900">
                    <img src={previewTarget.originalUrl} alt="Preview" className="mx-auto max-h-72 w-auto object-contain" />
                    {mode === 'text' && text.trim() && (
                      <span
                        style={{ ...overlayPositionStyle(position), color, opacity, fontSize: `${Math.max(10, fontSize * 0.4)}px` }}
                        className="pointer-events-none select-none font-bold"
                      >
                        {text}
                      </span>
                    )}
                    {mode === 'logo' && logoUrl && (
                      <img
                        src={logoUrl}
                        alt=""
                        style={{ ...overlayPositionStyle(position), opacity, width: '18%' }}
                        className="pointer-events-none select-none"
                      />
                    )}
                  </div>
                </div>
              )}

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

              {!canApply && (
                <p className="mt-3 text-xs text-amber-600 dark:text-amber-400">
                  {mode === 'text' ? 'Enter some watermark text to continue.' : 'Choose a logo image to continue.'}
                </p>
              )}
            </div>

            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {images.length} image{images.length !== 1 ? 's' : ''} in queue
              </h2>
              <button
                onClick={clearAll}
                className="text-xs font-medium text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 sm:text-sm"
              >
                Clear all
              </button>
            </div>

            {isProcessing && (
              <div className="mb-4">
                <div className="mb-1.5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Applying watermark…</span>
                  <span>
                    {settledCount}/{images.length}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 pb-6 lg:grid-cols-2">
              {images.map((img) => (
                <WatermarkCard
                  key={img.id}
                  image={img}
                  onRemove={removeImage}
                  onPreview={setPreviewId}
                  onDownload={(id) => {
                    const target = images.find((i) => i.id === id)
                    if (target) downloadSingle(target)
                  }}
                  onApply={(id) => {
                    if (canApply) void processImage(id, settings)
                  }}
                  onToggleSelect={toggleSelected}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {images.length > 0 && (
        <DownloadBar
          totalImages={images.length}
          selectedCount={selectedCount}
          totals={totals}
          isProcessing={isProcessing}
          actionLabel="Apply"
          actionInProgressLabel="Applying…"
          onAction={handleApplySelected}
          onDownloadAll={handleDownloadAll}
          onSelectAll={selectAll}
        />
      )}

      {previewImage && <PreviewModal image={previewImage} onClose={() => setPreviewId(null)} />}
    </>
  )
}
