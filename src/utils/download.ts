import { saveAs } from 'file-saver'
import JSZip from 'jszip'

/** Minimal shape needed to download an item — any tool's per-image state
 *  that has these two fields (QueueImage, ConvertImage, ...) can be passed. */
export interface Downloadable {
  fileName: string
  processedBlob?: Blob
}

export function downloadSingle(image: Downloadable) {
  if (!image.processedBlob) return
  saveAs(image.processedBlob, image.fileName)
}

export async function downloadAllAsZip(images: Downloadable[], zipName = 'compressed-images.zip') {
  const zip = new JSZip()
  const usedNames = new Set<string>()

  for (const image of images) {
    if (!image.processedBlob) continue
    let name = image.fileName
    let i = 1
    while (usedNames.has(name)) {
      const dot = image.fileName.lastIndexOf('.')
      const base = dot > 0 ? image.fileName.slice(0, dot) : image.fileName
      const ext = dot > 0 ? image.fileName.slice(dot) : ''
      name = `${base}-${i}${ext}`
      i++
    }
    usedNames.add(name)
    zip.file(name, image.processedBlob)
  }

  const blob = await zip.generateAsync({ type: 'blob', compression: 'STORE' })
  saveAs(blob, zipName)
}
