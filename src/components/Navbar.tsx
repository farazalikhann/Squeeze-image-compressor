import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { TOOLS } from '../lib/tools'
import { resolveRecentTools, useRecentTools } from '../hooks/useRecentTools'

interface Props {
  isDark: boolean
  onToggleDark: () => void
}

type OpenMenu = 'tools' | 'recent' | null

export default function Navbar({ isDark, onToggleDark }: Props) {
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null)
  const toolsRef = useRef<HTMLDivElement>(null)
  const recentRef = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const { recentIds, recordVisit } = useRecentTools()

  useEffect(() => {
    recordVisit(location.pathname)
    setOpenMenu(null)
  }, [location.pathname, recordVisit])

  useEffect(() => {
    if (!openMenu) return
    const onPointerDown = (e: MouseEvent) => {
      const ref = openMenu === 'tools' ? toolsRef : recentRef
      if (ref.current && !ref.current.contains(e.target as Node)) setOpenMenu(null)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenMenu(null)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [openMenu])

  const recentTools = resolveRecentTools(recentIds, TOOLS)

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-2.5 sm:px-6">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
              <path
                d="M4 16.5V6a2 2 0 0 1 2-2h9l5 5v7.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <path d="M8 13.5l2.5-3 2 2.5L15 9l3.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
            </svg>
          </div>
          <span className="truncate text-lg font-bold tracking-tight text-slate-900 dark:text-white">Squeeze</span>
        </Link>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            to="/"
            className={`hidden h-11 items-center rounded-lg px-3 text-sm font-medium transition-colors sm:flex ${
              location.pathname === '/'
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            Home
          </Link>

          <div className="relative" ref={toolsRef}>
            <button
              type="button"
              onClick={() => setOpenMenu((m) => (m === 'tools' ? null : 'tools'))}
              aria-expanded={openMenu === 'tools'}
              aria-haspopup="menu"
              className="flex h-11 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <GridIcon />
              <span>Tools</span>
              <ChevronIcon open={openMenu === 'tools'} />
            </button>

            {openMenu === 'tools' && (
              <div
                role="menu"
                className="fixed inset-x-3 top-[3.75rem] z-50 max-h-[75vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:absolute sm:inset-x-auto sm:top-auto sm:right-0 sm:mt-2 sm:w-80"
              >
                {TOOLS.map((tool) => {
                  const isCurrent = location.pathname === tool.path
                  return (
                    <Link
                      key={tool.id}
                      to={tool.path}
                      role="menuitem"
                      className={`flex min-h-12 items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors ${
                        isCurrent
                          ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400'
                          : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="text-lg" aria-hidden>
                        {tool.icon}
                      </span>
                      <span className="flex-1 font-medium">{tool.name}</span>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          tool.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {tool.status === 'active' ? 'Available' : 'Soon'}
                      </span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          <div className="relative" ref={recentRef}>
            <button
              type="button"
              onClick={() => setOpenMenu((m) => (m === 'recent' ? null : 'recent'))}
              aria-expanded={openMenu === 'recent'}
              aria-haspopup="menu"
              aria-label="Recently used tools"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <ClockIcon />
            </button>

            {openMenu === 'recent' && (
              <div
                role="menu"
                className="fixed inset-x-3 top-[3.75rem] z-50 max-h-[75vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:absolute sm:inset-x-auto sm:top-auto sm:right-0 sm:mt-2 sm:w-72"
              >
                <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  Recently used
                </p>
                {recentTools.length === 0 ? (
                  <p className="px-3 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                    No recent tools yet — open one to see it here.
                  </p>
                ) : (
                  recentTools.map((tool) => (
                    <Link
                      key={tool.id}
                      to={tool.path}
                      role="menuitem"
                      className="flex min-h-12 items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      <span className="text-lg" aria-hidden>
                        {tool.icon}
                      </span>
                      <span className="flex-1 font-medium">{tool.name}</span>
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>

          <button
            onClick={onToggleDark}
            aria-label="Toggle dark mode"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </div>
    </header>
  )
}

function GridIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5" aria-hidden>
      <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}
function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function ClockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5" aria-hidden>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function SunIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}
function MoonIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5">
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  )
}
