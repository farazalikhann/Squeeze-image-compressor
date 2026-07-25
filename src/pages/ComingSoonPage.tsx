import { Link } from 'react-router-dom'
import type { ToolDefinition } from '../lib/tools'

interface Props {
  tool: ToolDefinition
}

export default function ComingSoonPage({ tool }: Props) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-3xl dark:bg-indigo-500/10">
        <span aria-hidden>{tool.icon}</span>
      </div>

      <span className="mt-5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
        Coming Soon
      </span>

      <h1 className="mt-3 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">{tool.name}</h1>
      <p className="mt-2.5 text-slate-500 dark:text-slate-400">{tool.description}</p>
      <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
        We're still building this one. Check back soon — like everything here, it'll run entirely in your browser.
      </p>

      <Link
        to="/"
        className="mt-7 inline-flex min-h-11 items-center justify-center rounded-lg bg-indigo-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
      >
        Back to all tools
      </Link>
    </div>
  )
}
