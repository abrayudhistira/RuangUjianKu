'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, BookOpen, ClipboardList, Users } from 'lucide-react'
import ThemeToggle from '@/components/theme/ThemeToggle'
import ProfileMenu from '@/components/profile/ProfileMenu'

type AdminHeaderProps = {
  name?: string | null
  email?: string | null
  avatarUrl?: string | null
}

const shortcuts = [
  { href: '/admin/exams', label: 'Ujian', icon: BookOpen },
  { href: '/admin/questions', label: 'Soal', icon: ClipboardList },
  { href: '/admin/participants', label: 'Peserta', icon: Users },
  { href: '/admin/results', label: 'Hasil', icon: BarChart3 },
]

export default function AdminHeader({ name, email, avatarUrl }: AdminHeaderProps) {
  const pathname = usePathname()

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto flex min-h-16 items-center justify-between gap-3 px-4 py-2">
        <Link href="/admin" className="shrink-0 text-base font-semibold sm:text-lg">Ruang UjianKu Admin</Link>
        <nav aria-label="Shortcut admin" className="hidden items-center gap-1 md:flex">
          {shortcuts.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} title={label} aria-label={`Buka ${label}`} className={`inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg border px-2 transition focus-visible:ring-2 focus-visible:ring-accent lg:px-3 ${isActive(href) ? 'border-accent bg-accent/15 text-accent shadow-sm' : 'border-transparent text-muted-foreground hover:bg-secondary hover:text-foreground'}`}>
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span className="hidden lg:inline text-sm">{label}</span>
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle />
          <ProfileMenu name={name} email={email} avatarUrl={avatarUrl} />
          <form action="/auth/logout" method="POST">
            <button type="submit" className="min-h-11 px-2 text-sm text-muted-foreground transition hover:text-foreground sm:px-3">Keluar</button>
          </form>
        </div>
      </div>
      <nav aria-label="Shortcut admin mobile" className="flex gap-1 overflow-x-auto border-t border-border px-3 py-1 md:hidden">
        {shortcuts.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={`inline-flex min-h-11 min-w-20 shrink-0 items-center justify-center gap-1 rounded-lg border px-2 text-xs transition focus-visible:ring-2 focus-visible:ring-accent ${isActive(href) ? 'border-accent bg-accent/15 text-accent shadow-sm' : 'border-transparent text-muted-foreground hover:bg-secondary hover:text-foreground'}`}>
            <Icon className="h-4 w-4" aria-hidden="true" />{label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
