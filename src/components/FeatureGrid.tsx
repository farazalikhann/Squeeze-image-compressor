const FEATURES = [
  {
    icon: '🔒',
    title: '100% private',
    description: 'Every image is processed locally in your browser. Files never leave your device.',
  },
  {
    icon: '🧰',
    title: 'One platform, many tools',
    description: 'Compress, resize, convert, crop, and more — all in one place, more added over time.',
  },
  {
    icon: '🖼️',
    title: 'Format-friendly',
    description: 'Works with JPG, PNG, WebP, AVIF, and HEIC, with automatic fallbacks where needed.',
  },
  {
    icon: '📦',
    title: 'Batch processing',
    description: 'Drop in up to 100 images and process them all, then download as one ZIP.',
  },
  {
    icon: '🧹',
    title: 'Metadata removed',
    description: 'EXIF and location data is stripped automatically — no extra step required.',
  },
  {
    icon: '🚫',
    title: 'No accounts, no tracking',
    description: 'Nothing to sign up for, nothing sent to a server. Just open a tool and use it.',
  },
]

export default function FeatureGrid() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
          Everything you need, nothing leaves your device
        </h2>
        <p className="mt-2.5 text-slate-500 dark:text-slate-400">
          A growing toolkit that runs entirely client-side.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="rounded-2xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-xl dark:bg-indigo-500/10">
              {f.icon}
            </div>
            <h3 className="mt-3.5 text-sm font-semibold text-slate-800 dark:text-slate-100">{f.title}</h3>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{f.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
