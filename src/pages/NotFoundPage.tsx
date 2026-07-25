import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">404</p>
      <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Page not found</h1>
      <p className="mt-2.5 text-slate-500 dark:text-slate-400">
        That page doesn't exist. It may have moved, or the link might be broken.
      </p>
      <Link
        to="/"
        className="mt-7 inline-flex min-h-11 items-center justify-center rounded-lg bg-indigo-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
      >
        Back to home
      </Link>
    </div>
  )
}
