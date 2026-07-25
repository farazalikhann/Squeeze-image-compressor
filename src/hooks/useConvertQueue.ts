import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { OutputFormat, QueueStatus } from '../types'
import { FORMAT_EXT } from '../types'
import { genId, stripExtension } from '../utils/format'
import { getImageDimensions } from '../utils/imageLoader'
import { convertImage } from '../utils/convert'
import { guessFormatFromFile } from '../utils/resolveFormat'
import { isAcceptedImageFile, MAX_FILES } from '../utils/fileValidation'
import { runWithConcurrency } from '../utils/concurrency'

export { MAX_FILES }
const CONCURRENCY = 3

export interface ConvertImage {
  id: string
  file: File
  originalUrl: string
  originalSize: number
  originalWidth: number
  originalHeight: number
  originalFormat: OutputFormat
  fileName: string
  status: QueueStatus
  errorMessage?: string
  processedBlob?: Blob
  processedUrl?: string
  processedSize?: number
  processedWidth?: number
  processedHeight?: number
  processedFormat?: OutputFormat
  processingTimeMs?: number
  selected: boolean
}

export function useConvertQueue() {
  const [images, setImages] = useState<ConvertImage[]>([])
  const [rejectedFiles, setRejectedFiles] = useState<string[]>([])
  const imagesRef = useRef<ConvertImage[]>([])
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
    const accepted = fileList.filter(isAcceptedImageFile)
    const rejected = fileList.filter((f) => !isAcceptedImageFile(f)).map((f) => f.name)
    const room = Math.max(0, MAX_FILES - imagesRef.current.length)
    const toAdd = accepted.slice(0, room)
    const overflowed = accepted.slice(room).map((f) => f.name)

    const allRejected = [...rejected, ...overflowed]
    if (allRejected.length > 0) setRejectedFiles(allRejected)
    if (toAdd.length === 0) return

    const placeholders: ConvertImage[] = toAdd.map((file) => ({
      id: genId(),
      file,
      originalUrl: URL.createObjectURL(file),
      originalSize: file.size,
      originalWidth: 0,
      originalHeight: 0,
      originalFormat: guessFormatFromFile(file),
      fileName: file.name,
      status: 'pending',
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

  const toggleSelected = useCallback((id: string) => {
    setImages((prev) => prev.map((img) => (img.id === id ? { ...img, selected: !img.selected } : img)))
  }, [])

  const selectAll = useCallback((selected: boolean) => {
    setImages((prev) => prev.map((img) => ({ ...img, selected })))
  }, [])

  const processImage = useCallback(async (id: string, targetFormat: OutputFormat) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, status: 'processing', errorMessage: undefined } : img)),
    )

    const target = imagesRef.current.find((img) => img.id === id)
    if (!target) return

    try {
      const result = await convertImage(target.file, targetFormat)
      const url = URL.createObjectURL(result.blob)

      setImages((prev) =>
        prev.map((img) => {
          if (img.id !== id) return img
          if (img.processedUrl) URL.revokeObjectURL(img.processedUrl)
          const base = stripExtension(img.file.name)
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
            errorMessage: result.formatFellBack
              ? `Your browser can't encode this format here, so we used ${result.format.replace('image/', '').toUpperCase()} instead.`
              : undefined,
          }
        }),
      )
    } catch (err) {
      setImages((prev) =>
        prev.map((img) =>
          img.id === id
            ? { ...img, status: 'error', errorMessage: err instanceof Error ? err.message : 'Failed to convert image' }
            : img,
        ),
      )
    }
  }, [])

  const convertMany = useCallback(
    async (ids: string[], targetFormat: OutputFormat) => {
      await runWithConcurrency(ids, CONCURRENCY, (id) => processImage(id, targetFormat))
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
    toggleSelected,
    selectAll,
    processImage,
    convertMany,
    totals,
  }
}
