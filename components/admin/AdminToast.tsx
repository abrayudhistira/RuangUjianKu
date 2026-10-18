'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, X } from 'lucide-react'

interface AdminToastProps {
  message: string
  onClose?: () => void
  duration?: number
}

export default function AdminToast({ message, onClose, duration = 3000 }: AdminToastProps) {
  const [remaining, setRemaining] = useState(duration)

  useEffect(() => {
    const startedAt = Date.now()
    const timer = window.setInterval(() => {
      const elapsed = Date.now() - startedAt
      const next = Math.max(0, duration - elapsed)
      setRemaining(next)
      if (next === 0) {
        window.clearInterval(timer)
        onClose?.()
      }
    }, 50)
    return () => window.clearInterval(timer)
  }, [duration, onClose])

  return (
    <div className="fixed right-4 top-4 z-[60] w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-xl border border-accent/30 bg-card text-card-foreground shadow-2xl" role="status" aria-live="polite">
      <div className="flex items-start gap-3 p-4">
        <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
        <p className="flex-1 text-sm font-medium">{message}</p>
        <button type="button" onClick={onClose} className="min-h-8 min-w-8 rounded-lg text-muted-foreground hover:bg-secondary" aria-label="Tutup notifikasi">
          <X className="mx-auto h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <div className="h-1 bg-secondary" aria-hidden="true">
        <div className="h-full bg-accent transition-[width]" style={{ width: `${(remaining / duration) * 100}%` }} />
      </div>
    </div>
  )
}
