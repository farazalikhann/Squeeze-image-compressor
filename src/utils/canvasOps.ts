import type { ImageEdits } from '../types'

/** Applies crop -> rotate -> flip -> resize to a source bitmap and returns a canvas
 *  holding the final pixel data, ready to be encoded. */
export function renderEditedCanvas(
  source: ImageBitmap | HTMLCanvasElement,
  edits: ImageEdits,
): HTMLCanvasElement {
  const srcWidth = source.width
  const srcHeight = source.height

  // 1. Crop (in source pixel space)
  const crop = edits.crop
  const cropX = crop ? Math.max(0, Math.min(crop.x, srcWidth)) : 0
  const cropY = crop ? Math.max(0, Math.min(crop.y, srcHeight)) : 0
  const cropW = crop ? Math.max(1, Math.min(crop.width, srcWidth - cropX)) : srcWidth
  const cropH = crop ? Math.max(1, Math.min(crop.height, srcHeight - cropY)) : srcHeight

  const cropCanvas = document.createElement('canvas')
  cropCanvas.width = cropW
  cropCanvas.height = cropH
  const cropCtx = cropCanvas.getContext('2d')!
  cropCtx.drawImage(source, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH)

  // 2. Rotate
  const rotated = document.createElement('canvas')
  const swap = edits.rotate === 90 || edits.rotate === 270
  rotated.width = swap ? cropH : cropW
  rotated.height = swap ? cropW : cropH
  const rotCtx = rotated.getContext('2d')!
  rotCtx.translate(rotated.width / 2, rotated.height / 2)
  rotCtx.rotate((edits.rotate * Math.PI) / 180)
  rotCtx.drawImage(cropCanvas, -cropW / 2, -cropH / 2)

  // 3. Flip
  const flipped = document.createElement('canvas')
  flipped.width = rotated.width
  flipped.height = rotated.height
  const flipCtx = flipped.getContext('2d')!
  flipCtx.translate(edits.flipH ? flipped.width : 0, edits.flipV ? flipped.height : 0)
  flipCtx.scale(edits.flipH ? -1 : 1, edits.flipV ? -1 : 1)
  flipCtx.drawImage(rotated, 0, 0)

  // 4. Resize
  if (!edits.resize.enabled || (!edits.resize.width && !edits.resize.height)) {
    return flipped
  }

  let targetW = Number(edits.resize.width) || flipped.width
  let targetH = Number(edits.resize.height) || flipped.height

  if (edits.resize.keepAspect) {
    const aspect = flipped.width / flipped.height
    if (edits.resize.width && !edits.resize.height) {
      targetH = Math.round(targetW / aspect)
    } else if (edits.resize.height && !edits.resize.width) {
      targetW = Math.round(targetH * aspect)
    } else if (edits.resize.width && edits.resize.height) {
      // Fit within the box while preserving aspect ratio.
      const scale = Math.min(targetW / flipped.width, targetH / flipped.height)
      targetW = Math.max(1, Math.round(flipped.width * scale))
      targetH = Math.max(1, Math.round(flipped.height * scale))
    }
  }

  targetW = Math.max(1, Math.round(targetW))
  targetH = Math.max(1, Math.round(targetH))

  const resized = document.createElement('canvas')
  resized.width = targetW
  resized.height = targetH
  const resizeCtx = resized.getContext('2d')!
  resizeCtx.imageSmoothingEnabled = true
  resizeCtx.imageSmoothingQuality = 'high'
  resizeCtx.drawImage(flipped, 0, 0, targetW, targetH)

  return resized
}

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  mime: string,
  quality?: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error(`Failed to encode image as ${mime}`))
      },
      mime,
      quality,
    )
  })
}
