import type { jsPDF as JsPdfType } from 'jspdf'
import { loadImageBitmap } from './imageLoader'

export type PdfPageSize = 'a4' | 'letter' | 'fit'
export type PdfOrientation = 'portrait' | 'landscape'
export type PdfMargin = 'none' | 'small' | 'large'

export interface PdfOptions {
  pageSize: PdfPageSize
  orientation: PdfOrientation
  margin: PdfMargin
}

export interface PdfBuildResult {
  blob: Blob
  pageCount: number
  timeMs: number
}

const PAGE_SIZES_PT: Record<'a4' | 'letter', [number, number]> = {
  a4: [595.28, 841.89],
  letter: [612, 792],
}

const MARGIN_PT: Record<PdfMargin, number> = { none: 0, small: 24, large: 56 }

/** Cap the longest side of any embedded image so a batch of huge photos
 *  doesn't produce an unreasonably large or slow-to-generate PDF. */
const MAX_EMBED_DIM = 2000

export async function buildPdf(
  files: File[],
  options: PdfOptions,
  onProgress?: (done: number, total: number) => void,
): Promise<PdfBuildResult> {
  const startedAt = performance.now()
  const { jsPDF } = await import('jspdf')
  const margin = MARGIN_PT[options.margin]
  let doc: JsPdfType | null = null

  for (let i = 0; i < files.length; i++) {
    const { bitmap } = await loadImageBitmap(files[i])
    try {
      const scale = Math.min(1, MAX_EMBED_DIM / Math.max(bitmap.width, bitmap.height))
      const w = Math.max(1, Math.round(bitmap.width * scale))
      const h = Math.max(1, Math.round(bitmap.height * scale))

      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')!
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, w, h)
      ctx.drawImage(bitmap, 0, 0, w, h)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9)

      let pageW: number
      let pageH: number
      let orientation: PdfOrientation

      if (options.pageSize === 'fit') {
        orientation = w >= h ? 'landscape' : 'portrait'
        pageW = w + margin * 2
        pageH = h + margin * 2
      } else {
        orientation = options.orientation
        const [baseW, baseH] = PAGE_SIZES_PT[options.pageSize]
        if (orientation === 'landscape') {
          pageW = baseH
          pageH = baseW
        } else {
          pageW = baseW
          pageH = baseH
        }
      }

      if (!doc) {
        doc = new jsPDF({ orientation, unit: 'pt', format: [pageW, pageH] })
      } else {
        doc.addPage([pageW, pageH], orientation)
      }

      const availW = pageW - margin * 2
      const availH = pageH - margin * 2
      const imgAspect = w / h
      let drawW = availW
      let drawH = availW / imgAspect
      if (drawH > availH) {
        drawH = availH
        drawW = availH * imgAspect
      }
      const x = (pageW - drawW) / 2
      const y = (pageH - drawH) / 2
      doc.addImage(dataUrl, 'JPEG', x, y, drawW, drawH)

      onProgress?.(i + 1, files.length)
    } finally {
      bitmap.close()
    }
  }

  if (!doc) throw new Error('No images to combine')

  return {
    blob: doc.output('blob'),
    pageCount: files.length,
    timeMs: Math.round(performance.now() - startedAt),
  }
}
