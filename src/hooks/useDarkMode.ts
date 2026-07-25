import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'squeeze-theme'

function getInitial(): boolean {
  if (typeof window === 'undefined') return false
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) return stored === 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function useDarkMode() {
  const [isDark, setIsDark] = useState(getInitial)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light')
  }, [isDark])

  const toggle = useCallback(() => setIsDark((d) => !d), [])

  return { isDark, toggle }
}
