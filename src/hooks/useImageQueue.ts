import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CompressionSettings, ImageEdits, QueueImage } from '../types'
import { DEFAULT_EDITS, FORMAT_EXT } from '../types'
import { genId, stripExtension } from '../utils/format'
import { getImageDimensions } from '../utils/imageLoader'
import { compressImage } from '../utils/compress'

export const MAX_FILES = 100
const CONCURRENCY = 3

const ACCEPTED_EXT = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'heic', 'heif']
const ACCEPTED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/heic',
  'image/heif',
])

function isAcceptedFile(file: File): boolean {
  const ext = file.name.toLowerCase().split('.').pop() ?? ''
  return ACCEPTED_TYPES.has(file.type) || ACCEPTED_EXT.includes(ext)
}

async function runWithConcurrency<T>(items: T[], limit: number, worker: (item: T) => Promise<void>) {
  let cursor = 0
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const item = items[cursor]
      cursor++
      await worker(item)
    }
  })
  await Promise.all(runners)
}

export function useImageQueue() {
  const [images, setImages] = useState<QueueImage[]>([])
  const [rejectedFiles, setRejectedFiles] = useState<string[]>([])
  const imagesRef = useRef<QueueImage[]>([])
  imagesRef.current = images

  useEffect(() => {
    return () => {
      imagesRef.current.forEach((img) => {
        URL.revokeObjectURL(img.originalUrl)
        if (img.processedUrl) URL.revokeObjectURL(img.processedUrl)
      })
    }
  }, [])

  const addFiles = useCallback((fileList: File[]) => {
    const accepted = fileList.filter(isAcceptedFile)
    const rejected = fileList.filter((f) => !isAcceptedFile(f)).map((f) => f.name)
    const room = Math.max(0, MAX_FILES - imagesRef.current.length)
    const toAdd = accepted.slice(0, room)
    const overflowed = accepted.slice(room).map((f) => f.name)

    const allRejected = [...rejected, ...overflowed]
    if (allRejected.length > 0) setRejectedFiles(allRejected)
    if (toAdd.length === 0) return

    const placeholders: QueueImage[] = toAdd.map((file) => ({
      id: genId(),
      file,
      originalUrl: URL.createObjectURL(file),
      originalSize: file.size,
      originalWidth: 0,
      originalHeight: 0,
      fileName: file.name,
      status: 'pending',
      progress: 0,
      edits: { ...DEFAULT_EDITS, resize: { ...DEFAULT_EDITS.resize } },
      selected: true,
    }))

    setImages((prev) => [...prev, ...placeholders])

    placeholders.forEach((placeholder) => {
      getImageDimensions(placeholder.file)
        .then(({ width, height }) => {
          setImages((cur) =>
            cur.map((img) => (img.id === placeholder.id ? { ...img, originalWidth: width, originalHeight: height } : img)),
          )
        })
        .catch(() => {
          setImages((cur) =>
            cur.map((img) =>
              img.id === placeholder.id ? { ...img, status: 'error', errorMessage: 'Could not read this image' } : img,
            ),
          )
        })
    })
  }, [])

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const img = prev.find((i) => i.id === id)
      if (img) {
        URL.revokeObjectURL(img.originalUrl)
        if (img.processedUrl) URL.revokeObjectURL(img.processedUrl)
      }
      return prev.filter((i) => i.id !== id)
    })
  }, [])

  const clearAll = useCallback(() => {
    imagesRef.current.forEach((img) => {
      URL.revokeObjectURL(img.originalUrl)
      if (img.processedUrl) URL.revokeObjectURL(img.processedUrl)
    })
    setImages([])
  }, [])

  const updateEdits = useCallback((id: string, edits: Partial<ImageEdits>) => {
    setImages((prev) =>
      prev.map((img) =>
        img.id === id
          ? { ...img, edits: { ...img.edits, ...edits }, status: img.status === 'done' ? 'pending' : img.status }
          : img,
      ),
    )
  }, [])

  const renameImage = useCallback((id: string, fileName: string) => {
    setImages((prev) => prev.map((img) => (img.id === id ? { ...img, fileName } : img)))
  }, [])

  const bulkRename = useCallback((names: Map<string, string>) => {
    setImages((prev) => prev.map((img) => (names.has(img.id) ? { ...img, fileName: names.get(img.id)! } : img)))
  }, [])

  const toggleSelected = useCallback((id: string) => {
    setImages((prev) => prev.map((img) => (img.id === id ? { ...img, selected: !img.selected } : img)))
  }, [])

  const selectAll = useCallback((selected: boolean) => {
    setImages((prev) => prev.map((img) => ({ ...img, selected })))
  }, [])

  const processImage = useCallback(
    async (id: string, settings: CompressionSettings, overrides?: { edits?: ImageEdits; fileName?: string }) => {
      setImages((prev) =>
        prev.map((img) =>
          img.id === id
            ? {
                ...img,
                status: 'processing',
                errorMessage: undefined,
                ...(overrides?.edits ? { edits: overrides.edits } : {}),
                ...(overrides?.fileName ? { fileName: overrides.fileName } : {}),
              }
            : img,
        ),
      )

      const target = imagesRef.current.find((img) => img.id === id)
      if (!target) return

      const edits = overrides?.edits ?? target.edits
      const fileName = overrides?.fileName ?? target.fileName

      try {
        const result = await compressImage(target.file, edits, settings)
        const url = URL.createObjectURL(result.blob)

        const warnings: string[] = []
        if (result.formatFellBack) {
          warnings.push(
            `Your browser can't encode this format here, so we used ${result.format.replace('image/', '').toUpperCase()} instead.`,
          )
        }
        if (result.targetSizeReached === false) {
          warnings.push("Couldn't quite reach the target size — this is the smallest we could get.")
        }

        setImages((prev) =>
          prev.map((img) => {
            if (img.id !== id) return img
            if (img.processedUrl) URL.revokeObjectURL(img.processedUrl)
            const base = stripExtension(fileName || img.file.name)
            const ext = FORMAT_EXT[result.format]
            return {
              ...img,
              status: 'done',
              processedBlob: result.blob,
              processedUrl: url,
              processedSize: result.blob.size,
              processedWidth: result.width,
              processedHeight: result.height,
              processedFormat: result.format,
              processingTimeMs: result.timeMs,
              fileName: `${base}.${ext}`,
              progress: 100,
              errorMessage: warnings.length > 0 ? warnings.join(' ') : undefined,
            }
          }),
        )
      } catch (err) {
        setImages((prev) =>
          prev.map((img) =>
            img.id === id
              ? {
                  ...img,
                  status: 'error',
                  errorMessage: err instanceof Error ? err.message : 'Failed to process image',
                }
              : img,
          ),
        )
      }
    },
    [],
  )

  const compressMany = useCallback(
    async (ids: string[], settings: CompressionSettings) => {
      await runWithConcurrency(ids, CONCURRENCY, (id) => processImage(id, settings))
    },
    [processImage],
  )

  const clearRejected = useCallback(() => setRejectedFiles([]), [])

  const totals = useMemo(() => {
    const done = images.filter((img) => img.status === 'done' && img.processedSize != null)
    const originalTotal = done.reduce((sum, img) => sum + img.originalSize, 0)
    const processedTotal = done.reduce((sum, img) => sum + (img.processedSize ?? 0), 0)
    return {
      count: done.length,
      originalTotal,
      processedTotal,
      savedBytes: Math.max(0, originalTotal - processedTotal),
      savedPercent: originalTotal > 0 ? Math.max(0, ((originalTotal - processedTotal) / originalTotal) * 100) : 0,
    }
  }, [images])

  return {
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
  }
}
