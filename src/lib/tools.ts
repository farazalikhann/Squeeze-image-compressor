export type ToolStatus = 'active' | 'coming-soon'

export interface ToolDefinition {
  id: string
  name: string
  path: string
  description: string
  icon: string
  status: ToolStatus
}

/** Single source of truth for every tool on the platform — drives the
 *  homepage grid, the navbar switcher, and the route table. Add a new
 *  tool here first, then give it a page in src/pages. */
export const TOOLS: ToolDefinition[] = [
  {
    id: 'compress',
    name: 'Image Compressor',
    path: '/compress',
    description: 'Shrink file size with smart, custom, or lossless compression.',
    icon: '🗜️',
    status: 'active',
  },
  {
    id: 'resize',
    name: 'Image Resizer',
    path: '/resize',
    description: 'Resize to exact width & height, with presets and aspect lock.',
    icon: '📐',
    status: 'active',
  },
  {
    id: 'convert',
    name: 'Image Converter',
    path: '/convert',
    description: 'Convert between JPG, PNG, WebP, and AVIF, one image or a batch.',
    icon: '🔄',
    status: 'active',
  },
  {
    id: 'crop',
    name: 'Crop',
    path: '/crop',
    description: 'Drag an interactive crop box, with aspect ratio presets.',
    icon: '✂️',
    status: 'active',
  },
  {
    id: 'rotate',
    name: 'Rotate',
    path: '/rotate',
    description: 'Rotate in 90° steps or flip horizontally and vertically.',
    icon: '🔁',
    status: 'active',
  },
  {
    id: 'watermark',
    name: 'Watermark',
    path: '/watermark',
    description: 'Stamp a text or logo watermark, in a batch, 9-position grid.',
    icon: '💧',
    status: 'active',
  },
  {
    id: 'metadata-remover',
    name: 'Metadata Remover',
    path: '/metadata',
    description: 'See and strip camera, date & GPS data before you share.',
    icon: '🧹',
    status: 'active',
  },
  {
    id: 'image-to-pdf',
    name: 'Image to PDF',
    path: '/image-to-pdf',
    description: 'Combine one or more images into a single PDF.',
    icon: '📄',
    status: 'coming-soon',
  },
]

export function findToolByPath(path: string): ToolDefinition | undefined {
  return TOOLS.find((t) => t.path === path)
}
