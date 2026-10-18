'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'

export default function LoginForm() {
  const router = useRouter()
  const { signIn, signInWithGoogle } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await signIn(email, password)
    } catch (err: any) {
      setError(err.message || 'Gagal masuk')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div
          className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive"
          role="alert"
        >
          {error}
        </div>
      )}

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
          className="mt-2 min-h-12 w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/70 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/15"
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
          className="mt-2 min-h-12 w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/70 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/15"
          placeholder="Minimal 8 karakter"
          autoComplete="current-password"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="min-h-12 w-full rounded-xl bg-accent px-4 py-3 font-semibold text-on-accent shadow-lg shadow-accent/20 transition hover:-translate-y-0.5 hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? 'Memproses...' : 'Masuk'}
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
        className="min-h-12 w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 font-semibold text-on-secondary transition hover:-translate-y-0.5 hover:bg-secondary/70 flex items-center justify-center gap-2"
      >
        <img
          src="/google-icon.png"
          alt=""
          aria-hidden="true"
          className="h-5 w-5 object-contain"
        />
        Masuk dengan Google
      </button>

      <p className="text-center text-sm text-muted-foreground">
        Belum punya akun?{' '}
        <button
          type="button"
          onClick={() => router.push('/auth/register')}
          className="font-semibold text-accent underline-offset-4 hover:underline"
        >
          Daftar di sini
        </button>
      </p>
    </form>
  )
}

// Inline styles for Google icon SVG parts
// These are needed since we're using currentColor
