'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { UserCircle, Pencil } from 'lucide-react'

type ProfileMenuProps = {
  name?: string | null
  email?: string | null
  avatarUrl?: string | null
}

export default function ProfileMenu({ name, email, avatarUrl }: ProfileMenuProps) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const displayName = name?.trim() || 'Profil pengguna'
  const initials = displayName === 'Profil pengguna'
    ? 'P'
    : displayName.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Buka menu profil"
        className="inline-flex min-h-11 min-w-11 items-center justify-center overflow-hidden rounded-full border border-border bg-secondary p-1 text-on-secondary transition hover:border-accent focus-visible:ring-2 focus-visible:ring-accent"
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover sm:h-9 sm:w-9" />
        ) : (
          <span className="text-sm font-bold">{initials}</span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-64 rounded-xl border border-border bg-card p-3 text-card-foreground shadow-xl"
        >
          <div className="flex items-center gap-3 border-b border-border px-2 pb-3">
            <UserCircle className="h-8 w-8 shrink-0 text-accent" aria-hidden="true" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{displayName}</p>
              <p className="truncate text-xs text-muted-foreground">{email || 'Email tidak tersedia'}</p>
            </div>
          </div>
          <Link
            href="/profile"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="mt-2 flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm font-medium text-foreground transition hover:bg-secondary focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
            Edit profile
          </Link>
        </div>
      )}
    </div>
  )
}
