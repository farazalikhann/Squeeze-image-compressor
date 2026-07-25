import { useEffect, useRef, useState } from 'react'
import UploadZone from '../components/UploadZone'
import FaqSection from '../components/FaqSection'
import { formatBytes, formatDuration, genId } from '../utils/format'
import { getImageDimensions } from '../utils/imageLoader'
import { isAcceptedImageFile, MAX_FILES } from '../utils/fileValidation'
import { downloadSingle } from '../utils/download'
import { buildPdf } from '../utils/pdf'
import type { PdfMargin, PdfOrientation, PdfPageSize } from '../utils/pdf'
import { SEO_CONTENT } from '../lib/seoContent'

const seo = SEO_CONTENT['image-to-pdf']

interface PdfImageItem {
  id: string
  file: File
  url: string
  width: number
  height: number
  fileName: string
  size: number
}

interface PdfResult {
  url: string
  blob: Blob
  size: number
  pageCount: number
  timeMs: number
}

type Status = 'idle' | 'processing' | 'done' | 'error'

const PAGE_SIZE_OPTIONS: { value: PdfPageSize; label: string }[] = [
  { value: 'a4', label: 'A4' },
  { value: 'letter', label: 'Letter' },
  { value: 'fit', label: 'Fit to image' },
]

const MARGIN_OPTIONS: { value: PdfMargin; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'small', label: 'Small' },
  { value: 'large', label: 'Large' },
]

export default function PdfPage() {
  const [items, setItems] = useState<PdfImageItem[]>([])
  const [rejectedFiles, setRejectedFiles] = useState<string[]>([])
  const [pageSize, setPageSize] = useState<PdfPageSize>('a4')
  const [orientation, setOrientation] = useState<PdfOrientation>('portrait')
  const [margin, setMargin] = useState<PdfMargin>('small')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState<string | undefined>()
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [result, setResult] = useState<PdfResult | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)

  const itemsRef = useRef(items)
  itemsRef.current = items
  const resultRef = useRef(result)
  resultRef.current = result

  useEffect(() => {
    return () => {
      itemsRef.current.forEach((it) => URL.revokeObjectURL(it.url))
      if (resultRef.current) URL.revokeObjectURL(resultRef.current.url)
    }
  }, [])

  const isProcessing = status === 'processing'

  const addFiles = (files: File[]) => {
    const accepted = files.filter(isAcceptedImageFile)
    const rejected = files.filter((f) => !isAcceptedImageFile(f)).map((f) => f.name)
    const room = Math.max(0, MAX_FILES - itemsRef.current.length)
    const toAdd = accepted.slice(0, room)
    const overflowed = accepted.slice(room).map((f) => f.name)

    const allRejected = [...rejected, ...overflowed]
    if (allRejected.length > 0) setRejectedFiles(allRejected)
    if (toAdd.length === 0) return

    const placeholders: PdfImageItem[] = toAdd.map((file) => ({
      id: genId(),
      file,
      url: URL.createObjectURL(file),
      width: 0,
      height: 0,
      fileName: file.name,
      size: file.size,
    }))

    setItems((prev) => [...prev, ...placeholders])

    placeholders.forEach((placeholder) => {
      getImageDimensions(placeholder.file)
        .then(({ width, height }) => {
          setItems((cur) => cur.map((it) => (it.id === placeholder.id ? { ...it, width, height } : it)))
        })
        .catch(() => {
          // leave dimensions at 0 — the thumbnail still renders and buildPdf will surface a
          // clear error for this file specifically if it truly can't be decoded
        })
    })
  }

  const removeItem = (id: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id)
      if (item) URL.revokeObjectURL(item.url)
      return prev.filter((i) => i.id !== id)
    })
  }

  const clearAll = () => {
    itemsRef.current.forEach((it) => URL.revokeObjectURL(it.url))
    setItems([])
  }

  const clearRejected = () => setRejectedFiles([])

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>, id: string) => {
    setDraggingId(id)
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!draggingId) return
    const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null
    const itemEl = el?.closest<HTMLElement>('[data-pdf-item-id]')
    setOverId(itemEl?.dataset.pdfItemId ?? null)
  }

  const finishDrag = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (draggingId && overId && draggingId !== overId) {
      setItems((prev) => {
        const fromIdx = prev.findIndex((p) => p.id === draggingId)
        const toIdx = prev.findIndex((p) => p.id === overId)
        if (fromIdx === -1 || toIdx === -1) return prev
        const next = [...prev]
        const [moved] = next.splice(fromIdx, 1)
        next.splice(toIdx, 0, moved)
        return next
      })
    }
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      /* pointer capture may already be released */
    }
    setDraggingId(null)
    setOverId(null)
  }

  const handleBuild = async () => {
    if (items.length === 0) return
    setStatus('processing')
    setErrorMessage(undefined)
    setProgress({ done: 0, total: items.length })
    try {
      const r = await buildPdf(
        items.map((it) => it.file),
        { pageSize, orientation, margin },
        (done, total) => setProgress({ done, total }),
      )
      if (resultRef.current) URL.revokeObjectURL(resultRef.current.url)
      const url = URL.createObjectURL(r.blob)
      setResult({ url, blob: r.blob, size: r.blob.size, pageCount: r.pageCount, timeMs: r.timeMs })
      setStatus('done')
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Failed to create PDF')
    }
  }

  const handleDownload = () => {
    if (!result) return
    downloadSingle({ fileName: 'images.pdf', processedBlob: result.blob })
  }

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
        <UploadZone onFiles={addFiles} currentCount={items.length} />
      </div>

      {items.length > 0 && (
        <>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {items.length} image{items.length !== 1 ? 's' : ''} · drag <GripIcon inline /> to reorder
            </h2>
            <button
              onClick={clearAll}
              className="text-xs font-medium text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 sm:text-sm"
            >
              Clear all
            </button>
          </div>

          <div className="mb-6 flex flex-col gap-2">
            {items.map((item, index) => {
              const isDragging = draggingId === item.id
              const isOver = overId === item.id && draggingId !== null && draggingId !== item.id
              return (
                <div
                  key={item.id}
                  data-pdf-item-id={item.id}
                  className={`flex animate-fade-in items-center gap-3 rounded-2xl border bg-white p-2.5 shadow-sm transition-colors dark:bg-slate-900 sm:p-3 ${
                    isDragging ? 'opacity-50' : ''
                  } ${
                    isOver
                      ? 'border-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-500/30'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <button
                    type="button"
                    onPointerDown={(e) => handlePointerDown(e, item.id)}
                    onPointerMove={handlePointerMove}
                    onPointerUp={finishDrag}
                    onPointerCancel={finishDrag}
                    aria-label="Drag to reorder"
                    className="flex h-11 w-9 shrink-0 touch-none items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 active:cursor-grabbing dark:text-slate-500 dark:hover:bg-slate-800"
                    style={{ cursor: 'grab' }}
                  >
                    <GripIcon />
                  </button>

                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                    {index + 1}
                  </span>

                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                    <img src={item.url} alt={item.fileName} className="h-full w-full object-cover" draggable={false} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100" title={item.fileName}>
                      {item.fileName}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {item.width > 0 ? `${item.width}×${item.height}` : 'Reading…'} · {formatBytes(item.size)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-slate-500 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                  >
                    Remove
                  </button>
                </div>
              )
            })}
          </div>

          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Page setup</h3>

            <div className="mt-3">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Page size</span>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {PAGE_SIZE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPageSize(opt.value)}
                    className={`h-9 rounded-lg border px-3 text-xs font-medium transition-colors ${
                      pageSize === opt.value
                        ? 'border-indigo-500 bg-indigo-600 text-white'
                        : 'border-slate-200 text-slate-600 hover:border-indigo-300 dark:border-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {pageSize !== 'fit' && (
              <div className="mt-4">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Orientation</span>
                <div className="mt-1.5 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setOrientation('portrait')}
                    className={`h-9 rounded-lg border px-4 text-xs font-medium transition-colors ${
                      orientation === 'portrait'
                        ? 'border-indigo-500 bg-indigo-600 text-white'
                        : 'border-slate-200 text-slate-600 hover:border-indigo-300 dark:border-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Portrait
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrientation('landscape')}
                    className={`h-9 rounded-lg border px-4 text-xs font-medium transition-colors ${
                      orientation === 'landscape'
                        ? 'border-indigo-500 bg-indigo-600 text-white'
                        : 'border-slate-200 text-slate-600 hover:border-indigo-300 dark:border-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Landscape
                  </button>
                </div>
              </div>
            )}

            <div className="mt-4">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Margins</span>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {MARGIN_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setMargin(opt.value)}
                    className={`h-9 rounded-lg border px-3 text-xs font-medium transition-colors ${
                      margin === opt.value
                        ? 'border-indigo-500 bg-indigo-600 text-white'
                        : 'border-slate-200 text-slate-600 hover:border-indigo-300 dark:border-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleBuild}
              disabled={isProcessing}
              className="mt-5 flex h-11 w-full items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-6"
            >
              {isProcessing ? `Building… ${progress.done}/${progress.total}` : result ? 'Rebuild PDF' : 'Create PDF'}
            </button>

            {status === 'error' && errorMessage && (
              <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                {errorMessage}
              </p>
            )}
          </div>
        </>
      )}

      {result && (
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
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">PDF ready</h3>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <Stat label="Pages" value={String(result.pageCount)} />
            <Stat label="File size" value={formatBytes(result.size)} />
            <Stat label="Time taken" value={formatDuration(result.timeMs)} />
          </div>

          <button
            type="button"
            onClick={handleDownload}
            className="mt-5 flex h-11 w-full items-center justify-center rounded-lg bg-emerald-600 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 sm:w-auto sm:px-6"
          >
            Download PDF
          </button>
        </div>
      )}

      <FaqSection items={seo.faqs} />
    </main>
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

function GripIcon({ inline }: { inline?: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      className={inline ? 'inline h-3.5 w-3.5 -translate-y-0.5' : 'h-4 w-4'}
    >
      <circle cx="9" cy="6" r="1.4" fill="currentColor" />
      <circle cx="9" cy="12" r="1.4" fill="currentColor" />
      <circle cx="9" cy="18" r="1.4" fill="currentColor" />
      <circle cx="15" cy="6" r="1.4" fill="currentColor" />
      <circle cx="15" cy="12" r="1.4" fill="currentColor" />
      <circle cx="15" cy="18" r="1.4" fill="currentColor" />
    </svg>
  )
}
