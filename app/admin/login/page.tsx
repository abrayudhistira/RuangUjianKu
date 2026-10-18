'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AdminLoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError

      // Check if user is admin
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not found')

      const { data: userData, error: userError } = await (supabase as any)
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (userError || userData?.role !== 'admin') {
        throw new Error('Akses ditolak. Ini adalah area admin.')
      }

      router.push('/admin')
    } catch (err: any) {
      setError(err.message || 'Gagal masuk')
      // Sign out to prevent unauthorized access
      await supabase.auth.signOut()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Ruang UjianKu</h1>
          <p className="text-muted-foreground mt-2">Admin Login</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleLogin} className="space-y-4">
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
                className="w-full px-4 py-3 rounded-lg bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="admin@ambarsan.com"
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
                placeholder="Password"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-accent hover:bg-accent/90 text-on-accent font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Memproses...' : 'Login sebagai Admin'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}