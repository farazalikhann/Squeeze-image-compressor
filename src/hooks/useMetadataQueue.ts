import { useMediaQueue } from './useMediaQueue'
import { stripMetadata } from '../utils/stripMetadata'

export function useMetadataQueue() {
  return useMediaQueue<undefined>((file) => stripMetadata(file))
}
