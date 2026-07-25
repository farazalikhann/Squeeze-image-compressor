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
    description: 'Resize to exact dimensions or scale by percentage.',
    icon: '📐',
    status: 'coming-soon',
  },
  {
    id: 'convert',
    name: 'Image Converter',
    path: '/convert',
    description: 'Convert between JPG, PNG, WebP, and AVIF.',
    icon: '🔄',
    status: 'coming-soon',
  },
  {
    id: 'crop',
    name: 'Crop',
    path: '/crop',
    description: 'Crop images to the exact area you need.',
    icon: '✂️',
    status: 'coming-soon',
  },
  {
    id: 'rotate',
    name: 'Rotate',
    path: '/rotate',
    description: 'Rotate and flip images in any direction.',
    icon: '🔁',
    status: 'coming-soon',
  },
  {
    id: 'watermark',
    name: 'Watermark',
    path: '/watermark',
    description: 'Add a text or logo watermark to your images.',
    icon: '💧',
    status: 'coming-soon',
  },
  {
    id: 'metadata-remover',
    name: 'Metadata Remover',
    path: '/metadata-remover',
    description: 'Strip EXIF and location data for privacy.',
    icon: '🧹',
    status: 'coming-soon',
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
