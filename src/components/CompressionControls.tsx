import type { CompressionMode, CompressionSettings, OutputFormat } from '../types'
import { FORMAT_LABELS } from '../types'

interface ModeInfo {
  id: CompressionMode
  label: string
  description: string
}

const MODES: ModeInfo[] = [
  { id: 'smart', label: 'Smart', description: 'Balanced quality & size, picked automatically' },
  { id: 'max', label: 'Maximum', description: 'Smallest possible file size' },
  { id: 'custom', label: 'Custom', description: 'Set your own quality level' },
  { id: 'lossless', label: 'Lossless', description: 'Zero quality loss — PNG or WebP' },
  { id: 'lossy', label: 'Lossy', description: 'Quality-controlled — JPG, WebP or AVIF' },
  { id: 'target', label: 'Target Size', description: 'Hit an exact file size — great for forms & email limits' },
]

const TARGET_PRESETS_KB = [20, 50, 100]

const ALL_FORMATS: OutputFormat[] = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
const LOSSLESS_FORMATS: OutputFormat[] = ['image/png', 'image/webp']
const LOSSY_FORMATS: OutputFormat[] = ['image/jpeg', 'image/webp', 'image/avif']

function formatsForMode(mode: CompressionMode): OutputFormat[] {
  if (mode === 'lossless') return LOSSLESS_FORMATS
  if (mode === 'lossy' || mode === 'target') return LOSSY_FORMATS
  return ALL_FORMATS
}

interface Props {
  settings: CompressionSettings
  onChange: (settings: CompressionSettings) => void
}

export default function CompressionControls({ settings, onChange }: Props) {
  const availableFormats = formatsForMode(settings.mode)
  const showQuality = settings.mode === 'custom' || settings.mode === 'lossy'
  const showTargetSize = settings.mode === 'target'
  const showKeepOption = settings.mode === 'smart' || settings.mode === 'max' || settings.mode === 'custom'

  const setMode = (mode: CompressionMode) => {
    const formats = formatsForMode(mode)
    const nextFormat =
      settings.outputFormat !== 'keep' && !formats.includes(settings.outputFormat)
        ? formats[0]
        : settings.outputFormat === 'keep' && (mode === 'lossless' || mode === 'lossy' || mode === 'target')
          ? formats[0]
          : settings.outputFormat
    onChange({ ...settings, mode, outputFormat: nextFormat })
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Compression mode</h3>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            title={m.description}
            className={`rounded-xl border px-3 py-2.5 text-center text-sm font-medium transition-colors ${
              settings.mode === m.id
                ? 'border-indigo-500 bg-indigo-600 text-white shadow-sm'
                : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:text-indigo-400'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        {MODES.find((m) => m.id === settings.mode)?.description}
      </p>

      {showQuality && (
        <div className="mt-5">
          <div className="flex items-center justify-between">
            <label htmlFor="quality" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Quality
            </label>
            <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-sm font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400">
              {settings.quality}
            </span>
          </div>
          <input
            id="quality"
            type="range"
            min={1}
            max={100}
            value={settings.quality}
            onChange={(e) => onChange({ ...settings, quality: Number(e.target.value) })}
            style={{ ['--range-progress' as string]: `${settings.quality}%` }}
            className="range-slider mt-2 w-full"
          />
          <div className="mt-1 flex justify-between text-xs text-slate-400 dark:text-slate-500">
            <span>Smaller file</span>
            <span>Higher quality</span>
          </div>
        </div>
      )}

      {showTargetSize && (
        <div className="mt-5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Target size</label>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {TARGET_PRESETS_KB.map((kb) => (
              <button
                key={kb}
                type="button"
                onClick={() => onChange({ ...settings, targetSizeKB: kb })}
                className={`min-h-10 rounded-lg border px-3.5 text-sm font-medium transition-colors ${
                  settings.targetSizeKB === kb
                    ? 'border-indigo-500 bg-indigo-600 text-white'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {kb} KB
              </button>
            ))}
            <div className="flex min-h-10 items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 dark:border-slate-700 dark:bg-slate-800">
              <input
                type="number"
                min={1}
                inputMode="numeric"
                value={settings.targetSizeKB}
                onChange={(e) =>
                  onChange({ ...settings, targetSizeKB: Math.max(1, Math.round(Number(e.target.value) || 1)) })
                }
                className="w-16 bg-transparent text-sm text-slate-800 focus:outline-none dark:text-slate-100"
                aria-label="Custom target size in kilobytes"
              />
              <span className="text-xs text-slate-500 dark:text-slate-400">KB</span>
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            We'll binary-search the quality level to land at or under {settings.targetSizeKB} KB. If that's not
            possible, you'll see a warning with the smallest size we could reach.
          </p>
        </div>
      )}

      <div className="mt-5">
        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Output format</h4>
        <div className="mt-2 flex flex-wrap gap-2">
          {showKeepOption && (
            <button
              type="button"
              onClick={() => onChange({ ...settings, outputFormat: 'keep' })}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                settings.outputFormat === 'keep'
                  ? 'border-indigo-500 bg-indigo-600 text-white'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              Keep original
            </button>
          )}
          {availableFormats.map((fmt) => (
            <button
              key={fmt}
              type="button"
              onClick={() => onChange({ ...settings, outputFormat: fmt })}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                settings.outputFormat === fmt
                  ? 'border-indigo-500 bg-indigo-600 text-white'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {FORMAT_LABELS[fmt]}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
