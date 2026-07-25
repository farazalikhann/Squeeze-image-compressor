export default function Hero() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-10 pt-14 text-center sm:pt-20">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:ring-indigo-500/20">
        🔒 Files are processed in your browser. Nothing is uploaded.
      </span>

      <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl md:text-6xl">
        Compress images.
        <br />
        <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
          Keep them private.
        </span>
      </h1>

      <p className="mx-auto mt-5 max-w-xl text-base text-slate-600 dark:text-slate-400 sm:text-lg">
        Batch compress, resize, crop, and convert up to 100 images at once — JPG, PNG, WebP, AVIF. Everything runs
        locally on your device. No servers, no uploads, no tracking.
      </p>

      <div className="mt-7 flex flex-wrap items-center justify-center gap-4 text-sm text-slate-500 dark:text-slate-400">
        <Badge>⚡ Instant, in-browser</Badge>
        <Badge>🗜️ Smart or max compression</Badge>
        <Badge>📦 Free, unlimited batches</Badge>
      </div>
    </section>
  )
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 dark:border-slate-800 dark:bg-slate-900">
      {children}
    </span>
  )
}
