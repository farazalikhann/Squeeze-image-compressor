import { Link } from 'react-router-dom'
import type { ToolDefinition } from '../lib/tools'

interface Props {
  tool: ToolDefinition
}

export default function ToolCard({ tool }: Props) {
  const isActive = tool.status === 'active'

  return (
    <Link
      to={tool.path}
      className="group flex min-h-32 flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md active:shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-xl dark:bg-indigo-500/10">
          <span aria-hidden>{tool.icon}</span>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            isActive
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
              : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
          }`}
        >
          {isActive ? 'Available' : 'Coming Soon'}
        </span>
      </div>

      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">{tool.name}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400">{tool.description}</p>
    </Link>
  )
}
