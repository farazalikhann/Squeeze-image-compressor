import { useMemo, useState } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import FeatureGrid from './components/FeatureGrid'
import Footer from './components/Footer'
import UploadZone from './components/UploadZone'
import CompressionControls from './components/CompressionControls'
import ImageCard from './components/ImageCard'
import EditToolbar from './components/EditToolbar'
import PreviewModal from './components/PreviewModal'
import DownloadBar from './components/DownloadBar'
import BatchRenameModal from './components/BatchRenameModal'
import { useDarkMode } from './hooks/useDarkMode'
import { useImageQueue } from './hooks/useImageQueue'
import type { CompressionSettings, ImageEdits } from './types'
import { DEFAULT_SETTINGS } from './types'
import { downloadAllAsZip, downloadSingle } from './utils/download'

export default function App() {
  const { isDark, toggle } = useDarkMode()
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
    <div className="flex min-h-screen flex-col">
      <Header isDark={isDark} onToggleDark={toggle} />

      {images.length === 0 && (
        <>
          <Hero />
          <div className="mx-auto w-full max-w-3xl px-4">
            <UploadZone onFiles={addFiles} currentCount={images.length} />
          </div>
          <FeatureGrid />
        </>
      )}

      {images.length > 0 && (
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
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

          <div className="mb-6">
            <CompressionControls settings={settings} onChange={setSettings} />
          </div>

          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {images.length} image{images.length !== 1 ? 's' : ''} in queue
            </h2>
          </div>

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
        </main>
      )}

      {images.length === 0 && <Footer />}

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
    </div>
  )
}
