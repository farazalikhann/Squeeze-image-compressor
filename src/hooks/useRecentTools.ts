import { useCallback, useEffect, useState } from 'react'
import { findToolByPath } from '../lib/tools'
import type { ToolDefinition } from '../lib/tools'

const STORAGE_KEY = 'squeeze-recent-tools'
const MAX_RECENT = 5

function readStoredIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : []
  } catch {
    return []
  }
}

/** Tracks the last few tools visited, persisted in localStorage, for the
 *  Navbar's "Recent" dropdown. Call `recordVisit` with the current pathname
 *  whenever the route changes; only known, active tool paths are recorded. */
export function useRecentTools() {
  const [recentIds, setRecentIds] = useState<string[]>(() => readStoredIds())

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setRecentIds(readStoredIds())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const recordVisit = useCallback((pathname: string) => {
    const tool = findToolByPath(pathname)
    if (!tool) return
    setRecentIds((prev) => {
      const next = [tool.id, ...prev.filter((id) => id !== tool.id)].slice(0, MAX_RECENT)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        /* localStorage may be unavailable (private mode, quota) — recent list just won't persist */
      }
      return next
    })
  }, [])

  return { recentIds, recordVisit }
}

export function resolveRecentTools(recentIds: string[], allTools: ToolDefinition[]): ToolDefinition[] {
  return recentIds
    .map((id) => allTools.find((t) => t.id === id))
    .filter((t): t is ToolDefinition => !!t)
}
