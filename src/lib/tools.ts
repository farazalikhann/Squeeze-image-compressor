export type ToolStatus = 'active' | 'coming-soon'

export type ToolCategory = 'compress' | 'convert' | 'edit' | 'privacy'

export interface ToolDefinition {
  id: string
  name: string
  path: string
  description: string
  icon: string
  status: ToolStatus
  category: ToolCategory
}

export interface CategoryMeta {
  label: string
  description: string
  colorClasses: string
}

/** Visual + copy metadata per category — drives the colored icon squares on
 *  cards, the category filter chips, and the homepage section headers. */
export const CATEGORY_META: Record<ToolCategory, CategoryMeta> = {
  compress: {
    label: 'Compress',
    description: 'Shrink file size without losing quality',
    colorClasses: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400',
  },
  convert: {
    label: 'Convert',
    description: 'Change format or combine into a document',
    colorClasses: 'bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400',
  },
  edit: {
    label: 'Edit',
    description: 'Resize, crop, rotate, and stamp your images',
    colorClasses: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
  },
  privacy: {
    label: 'Privacy',
    description: 'See and strip what your files reveal',
    colorClasses: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
  },
}

export const CATEGORY_ORDER: ToolCategory[] = ['compress', 'convert', 'edit', 'privacy']

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
    category: 'compress',
  },
  {
    id: 'resize',
    name: 'Image Resizer',
    path: '/resize',
    description: 'Resize to exact width & height, with presets and aspect lock.',
    icon: '📐',
    status: 'active',
    category: 'edit',
  },
  {
    id: 'convert',
    name: 'Image Converter',
    path: '/convert',
    description: 'Convert between JPG, PNG, WebP, and AVIF, one image or a batch.',
    icon: '🔄',
    status: 'active',
    category: 'convert',
  },
  {
    id: 'crop',
    name: 'Crop',
    path: '/crop',
    description: 'Drag an interactive crop box, with aspect ratio presets.',
    icon: '✂️',
    status: 'active',
    category: 'edit',
  },
  {
    id: 'rotate',
    name: 'Rotate',
    path: '/rotate',
    description: 'Rotate in 90° steps or flip horizontally and vertically.',
    icon: '🔁',
    status: 'active',
    category: 'edit',
  },
  {
    id: 'watermark',
    name: 'Watermark',
    path: '/watermark',
    description: 'Stamp a text or logo watermark, in a batch, 9-position grid.',
    icon: '💧',
    status: 'active',
    category: 'edit',
  },
  {
    id: 'metadata-remover',
    name: 'Metadata Remover',
    path: '/metadata',
    description: 'See and strip camera, date & GPS data before you share.',
    icon: '🧹',
    status: 'active',
    category: 'privacy',
  },
  {
    id: 'image-to-pdf',
    name: 'Image to PDF',
    path: '/pdf',
    description: 'Combine and reorder images into a single PDF.',
    icon: '📄',
    status: 'active',
    category: 'convert',
  },
]

export function findToolByPath(path: string): ToolDefinition | undefined {
  return TOOLS.find((t) => t.path === path)
}

export function findToolById(id: string): ToolDefinition | undefined {
  return TOOLS.find((t) => t.id === id)
}
