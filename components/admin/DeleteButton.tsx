'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import AdminToast from './AdminToast'

interface DeleteButtonProps {
  action: string
  title?: string
  confirmMessage?: string
  method?: 'post' | 'delete'
  children?: React.ReactNode
}

export default function DeleteButton({ action, title = 'Hapus', confirmMessage = 'Yakin ingin menghapus?', method = 'post' }: DeleteButtonProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!confirm(confirmMessage)) return
    setLoading(true)
    setError(null)
    try {
      const formData = new FormData(e.currentTarget)
      const requestMethod = method === 'post' ? 'POST' : 'DELETE'
      const response = await fetch(action, {
        method: requestMethod,
        headers: method === 'post' ? { 'Content-Type': 'application/json' } : undefined,
        body: method === 'post' ? JSON.stringify({ _method: 'DELETE' }) : formData,
      })
      const result = await response.json()
      if (!response.ok || !result.success) throw new Error(result.error || 'Gagal menghapus')
      setSuccess(true)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        {method === 'post' && <input type="hidden" name="_method" value="DELETE" />}
        <button type="submit" disabled={loading} className="min-h-11 min-w-11 rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50" title={title}>
          {loading ? <span className="block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <Trash2 className="h-4 w-4" />}
        </button>
      </form>
      {success && <AdminToast message="Data berhasil dihapus." onClose={() => setSuccess(false)} />}
      {error && <AdminToast message={error} onClose={() => setError(null)} />}
    </>
  )
}
