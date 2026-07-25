import { guessFormatFromFile } from './resolveFormat'
import { convertImage } from './convert'

/** Removing EXIF/GPS is just re-encoding through canvas — canvas pixel data
 *  never carries metadata, so redrawing the image (same format, same size)
 *  strips everything. Reuses the converter's pipeline instead of duplicating it. */
export async function stripMetadata(file: File) {
  return convertImage(file, guessFormatFromFile(file))
}
