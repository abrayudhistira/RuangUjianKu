'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, History } from 'lucide-react'
import ThemeToggle from '@/components/theme/ThemeToggle'
import ProfileMenu from '@/components/profile/ProfileMenu'

type UserHeaderProps = { name?: string | null; email?: string | null; avatarUrl?: string | null }

export default function UserHeader({ name, email, avatarUrl }: UserHeaderProps) {
  const pathname = usePathname()
  const links = [
    { href: '/', label: 'Ujian', icon: BookOpen },
    { href: '/results', label: 'Riwayat', icon: History },
  ]
  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)
  const activeClass = (href: string) => isActive(href)
    ? 'border-accent bg-accent/15 text-accent shadow-sm'
    : 'border-transparent text-muted-foreground hover:bg-secondary hover:text-foreground'

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto flex min-h-16 items-center justify-between gap-3 px-4 py-2">
        <Link href="/" className="flex shrink-0 items-center gap-2 text-base font-semibold sm:text-lg">Ruang UjianKu</Link>
        <nav aria-label="Navigasi peserta" className="hidden items-center gap-1 sm:flex">
          {links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={`inline-flex min-h-11 items-center gap-2 rounded-lg border px-3 text-sm transition focus-visible:ring-2 focus-visible:ring-accent ${activeClass(href)}`}><Icon className="h-4 w-4" aria-hidden="true" />{label}</Link>)}
        </nav>
        <div className="flex items-center gap-1 sm:gap-2"><ThemeToggle /><ProfileMenu name={name} email={email} avatarUrl={avatarUrl} /><form action="/auth/logout" method="POST"><button type="submit" className="min-h-11 px-2 text-sm text-muted-foreground transition hover:text-foreground sm:px-3">Keluar</button></form></div>
      </div>
      <nav aria-label="Navigasi peserta mobile" className="flex gap-1 overflow-x-auto border-t border-border px-3 py-1 sm:hidden">
        {links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={`inline-flex min-h-11 min-w-24 shrink-0 items-center justify-center gap-1 rounded-lg border text-xs ${activeClass(href)}`}><Icon className="h-4 w-4" aria-hidden="true" />{label}</Link>)}
      </nav>
    </header>
  )
}
