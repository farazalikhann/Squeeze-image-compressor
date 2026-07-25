import { Link } from 'react-router-dom'
import type { ToolDefinition } from '../lib/tools'
import { CATEGORY_META } from '../lib/tools'

interface Props {
  tool: ToolDefinition
}

export default function ToolCard({ tool }: Props) {
  const isComingSoon = tool.status === 'coming-soon'
  const category = CATEGORY_META[tool.category]

  return (
    <Link
      to={tool.path}
      className="group flex min-h-36 flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-500/40"
    >
      <div className="flex items-start justify-between gap-2">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${category.colorClasses}`}>
          <span aria-hidden>{tool.icon}</span>
        </div>
        {isComingSoon && (
          <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            Coming Soon
          </span>
        )}
      </div>

      <div>
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">{tool.name}</h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{tool.description}</p>
      </div>

      <span className="mt-auto inline-flex w-fit items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
        🔒 On-device
      </span>
    </Link>
  )
}
