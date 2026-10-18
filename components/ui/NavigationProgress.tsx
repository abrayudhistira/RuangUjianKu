'use client'

import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export default function NavigationProgress() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(false)
  }, [pathname, searchParams])

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      const link = target?.closest('a[href]') as HTMLAnchorElement | null
      if (!link || link.target === '_blank' || link.hasAttribute('download')) return
      if (link.origin !== window.location.origin) return
      if (link.pathname === window.location.pathname && link.search === window.location.search) return
      setLoading(true)
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  if (!loading) return null

  return (
    <div
      className="fixed left-0 right-0 top-16 z-[60] h-1 overflow-hidden bg-destructive/15"
      role="progressbar"
      aria-label="Memuat halaman"
      aria-valuetext="Memuat halaman"
    >
      <div className="h-full w-2/5 animate-navigation-progress bg-destructive" />
    </div>
  )
}
