import { useMemo, useState } from 'react'
import UploadZone from '../components/UploadZone'
import CompressionControls from '../components/CompressionControls'
import ImageCard from '../components/ImageCard'
import EditToolbar from '../components/EditToolbar'
import PreviewModal from '../components/PreviewModal'
import DownloadBar from '../components/DownloadBar'
import BatchRenameModal from '../components/BatchRenameModal'
import { useImageQueue } from '../hooks/useImageQueue'
import type { CompressionSettings, ImageEdits } from '../types'
import { DEFAULT_SETTINGS } from '../types'
import { downloadAllAsZip, downloadSingle } from '../utils/download'

export default function CompressPage() {
  const {
    images,
    rejectedFiles,
    clearRejected,
    addFiles,
    removeImage,
    clearAll,
    updateEdits,
    renameImage,
    bulkRename,
    toggleSelected,
    selectAll,
    processImage,
    compressMany,
    totals,
  } = useImageQueue()

  const [settings, setSettings] = useState<CompressionSettings>(DEFAULT_SETTINGS)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [showRename, setShowRename] = useState(false)

  const isProcessing = images.some((img) => img.status === 'processing')
  const selectedCount = images.filter((img) => img.selected).length
  const settledCount = images.filter((img) => img.status === 'done' || img.status === 'error').length
  const progressPercent = images.length > 0 ? Math.round((settledCount / images.length) * 100) : 0
  const editingImage = useMemo(() => images.find((img) => img.id === editingId) ?? null, [images, editingId])
  const previewImage = useMemo(() => images.find((img) => img.id === previewId) ?? null, [images, previewId])

  const handleCompressSelected = () => {
    const ids = images.filter((img) => img.selected).map((img) => img.id)
    if (ids.length > 0) void compressMany(ids, settings)
  }

  const handleDownloadAll = () => {
    const done = images.filter((img) => img.status === 'done' && img.processedBlob)
    if (done.length > 0) void downloadAllAsZip(done)
  }

  const handleSaveEdits = (id: string, edits: ImageEdits, fileName: string) => {
    updateEdits(id, edits)
    renameImage(id, fileName)
    setEditingId(null)
    void processImage(id, settings, { edits, fileName })
  }

  return (
    <>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Image Compressor</h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500 dark:text-slate-400 sm:text-base">
            Batch compress up to 100 images with smart, custom, or lossless quality. Everything happens on your
            device.
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
            <div className="mb-6">
              <CompressionControls settings={settings} onChange={setSettings} />
            </div>

            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {images.length} image{images.length !== 1 ? 's' : ''} in queue
              </h2>
            </div>

            {isProcessing && (
              <div className="mb-4">
                <div className="mb-1.5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Compressing…</span>
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
                <ImageCard
                  key={img.id}
                  image={img}
                  onRemove={removeImage}
                  onEdit={setEditingId}
                  onPreview={setPreviewId}
                  onDownload={(id) => {
                    const target = images.find((i) => i.id === id)
                    if (target) downloadSingle(target)
                  }}
                  onCompress={(id) => void processImage(id, settings)}
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
          onCompressSelected={handleCompressSelected}
          onDownloadAll={handleDownloadAll}
          onSelectAll={selectAll}
          onClearAll={clearAll}
          onBatchRename={() => setShowRename(true)}
        />
      )}

      {editingImage && (
        <EditToolbar image={editingImage} onClose={() => setEditingId(null)} onSave={handleSaveEdits} />
      )}

      {previewImage && <PreviewModal image={previewImage} onClose={() => setPreviewId(null)} />}

      {showRename && (
        <BatchRenameModal images={images} onClose={() => setShowRename(false)} onApply={bulkRename} />
      )}
    </>
  )
}
