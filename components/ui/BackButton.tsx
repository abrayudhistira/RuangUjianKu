'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function BackButton({ fallback = '/' }: { fallback?: string }) {
  const router = useRouter()

  return (
    <button
      type="button"
      onClick={() => {
        if (window.history.length > 1) router.back()
        else router.push(fallback)
      }}
      className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium text-foreground transition hover:bg-secondary focus-visible:ring-2 focus-visible:ring-accent"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      Kembali
    </button>
  )
}
