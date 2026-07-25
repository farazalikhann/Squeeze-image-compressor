import { useMediaQueue } from './useMediaQueue'
import { watermarkImage } from '../utils/watermark'
import type { WatermarkSettings } from '../utils/watermark'

export function useWatermarkQueue() {
  return useMediaQueue<WatermarkSettings>((file, settings) => watermarkImage(file, settings))
}
