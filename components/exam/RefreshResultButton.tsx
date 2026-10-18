'use client'

import { RefreshCw } from 'lucide-react'

export default function RefreshResultButton() {
  return (
    <button
      type="button"
      onClick={() => window.location.reload()}
      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-border px-6 py-3 sm:w-auto text-muted-foreground transition hover:bg-secondary/50 focus-visible:ring-2 focus-visible:ring-accent"
    >
      <RefreshCw className="h-5 w-5" aria-hidden="true" />
      Cek Ulang
    </button>
  )
}
