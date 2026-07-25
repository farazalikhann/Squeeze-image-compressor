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
      className="group flex flex-col gap-2 rounded-xl border border-indigo-200/70 bg-white p-3.5 transition-all hover:-translate-y-0.5 hover:border-indigo-400 hover:shadow-md hover:shadow-indigo-100 dark:border-indigo-500/25 dark:bg-slate-900 dark:hover:border-indigo-400/60 dark:hover:shadow-indigo-500/10"
    >
      <div className="flex items-start justify-between gap-2">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg ${category.colorClasses}`}>
          <span aria-hidden>{tool.icon}</span>
        </div>
        {isComingSoon && (
          <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            Coming Soon
          </span>
        )}
      </div>

      <div className="min-w-0">
        <h3 className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{tool.name}</h3>
        <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">{tool.description}</p>
      </div>

      <span className="mt-auto inline-flex w-fit items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
        🔒 On-device
      </span>
    </Link>
  )
}
