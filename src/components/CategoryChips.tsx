import type { ToolCategory } from '../lib/tools'
import { CATEGORY_META, CATEGORY_ORDER } from '../lib/tools'

export type CategoryFilter = ToolCategory | 'all'

interface Props {
  value: CategoryFilter
  onChange: (value: CategoryFilter) => void
}

export default function CategoryChips({ value, onChange }: Props) {
  return (
    <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:justify-center sm:px-0">
      <Chip active={value === 'all'} onClick={() => onChange('all')}>
        All tools
      </Chip>
      {CATEGORY_ORDER.map((cat) => (
        <Chip key={cat} active={value === cat} onClick={() => onChange(cat)}>
          {CATEGORY_META[cat].label}
        </Chip>
      ))}
    </div>
  )
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-10 shrink-0 whitespace-nowrap rounded-full border px-4 text-sm font-medium transition-colors ${
        active
          ? 'border-indigo-500 bg-indigo-600 text-white'
          : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:text-indigo-400'
      }`}
    >
      {children}
    </button>
  )
}
