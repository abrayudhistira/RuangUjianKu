'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'

export default function RegisterForm() {
  const router = useRouter()
  const { signUp, signInWithGoogle } = useAuth()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError('Password tidak cocok')
      setLoading(false)
      return
    }

    if (password.length < 8) {
      setError('Password minimal 8 karakter')
      setLoading(false)
      return
    }

    try {
      await signUp(email, password, fullName)
      // After registration, redirect to login
      router.push('/auth/login')
    } catch (err: any) {
      setError(err.message || 'Gagal mendaftar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div
          className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive"
          role="alert"
        >
          {error}
        </div>
      )}

      <div>
        <label htmlFor="fullName" className="block text-sm font-medium mb-2">
          Nama Lengkap
        </label>
        <input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-lg bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-accent"
          placeholder="Nama lengkap"
          autoComplete="name"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-2">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-lg bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-accent"
          placeholder="nama@email.com"
          autoComplete="email"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-2">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          className="w-full px-4 py-3 rounded-lg bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-accent"
          placeholder="Minimal 8 karakter"
          autoComplete="new-password"
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
          Konfirmasi Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={8}
          className="w-full px-4 py-3 rounded-lg bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-accent"
          placeholder="Ulangi password"
          autoComplete="new-password"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-4 bg-accent hover:bg-accent/90 text-on-accent font-semibold rounded-lg transition-colors disabled:opacity-50"
      >
        {loading ? 'Memproses...' : 'Daftar'}
      </button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="px-2 bg-background text-muted-foreground">ATAU</span>
        </div>
      </div>

      <button
        type="button"
        onClick={signInWithGoogle}
        className="w-full py-3 px-4 bg-secondary hover:bg-secondary/80 text-on-secondary font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <img
          src="/google-icon.png"
          alt=""
          aria-hidden="true"
          className="h-5 w-5 object-contain"
        />
        Daftar dengan Google
      </button>
    </form>
  )
}
