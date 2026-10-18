'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from './ThemeProvider'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const nextTheme = theme === 'dark' ? 'light' : 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Aktifkan mode ${nextTheme === 'dark' ? 'gelap' : 'terang'}`}
      title={`Mode ${nextTheme === 'dark' ? 'gelap' : 'terang'}`}
      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-border bg-secondary/40 text-foreground transition hover:bg-secondary/70 focus-visible:ring-2 focus-visible:ring-accent"
    >
      {theme === 'dark' ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
    </button>
  )
}
