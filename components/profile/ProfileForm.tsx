'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const MAX_UPLOAD_SIZE = 900 * 1024
const MAX_IMAGE_DIMENSION = 1600
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

async function compressImage(file: File): Promise<File> {
  if (file.size <= MAX_UPLOAD_SIZE && file.type !== 'image/gif') return file

  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(bitmap.width * scale))
  canvas.height = Math.max(1, Math.round(bitmap.height * scale))
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Browser tidak mendukung kompresi foto')
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()

  let quality = 0.82
  let blob: Blob | null = null
  while (quality >= 0.45) {
    blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
    if (blob && blob.size <= MAX_UPLOAD_SIZE) break
    quality -= 0.08
  }
  if (!blob || blob.size > MAX_UPLOAD_SIZE) throw new Error('Foto terlalu besar untuk dikompres di browser')
  return new File([blob], `${file.name.replace(/\\.[^/.]+$/, '')}.jpg`, { type: 'image/jpeg' })
}

type ProfileFormProps = {
  initialName: string
  email: string
  avatarUrl: string
  userId: string
}

export default function ProfileForm({ initialName, email, avatarUrl, userId }: ProfileFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [fullName, setFullName] = useState(initialName)
  const [avatar, setAvatar] = useState(avatarUrl)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState(avatarUrl)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(avatar)
      return
    }
    const objectUrl = URL.createObjectURL(selectedFile)
    setPreviewUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [selectedFile, avatar])

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] || null
    setError(null)
    setMessage(null)
    if (!file) {
      setSelectedFile(null)
      return
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      setSelectedFile(null)
      event.target.value = ''
      setError('Format foto harus JPG, PNG, WEBP, atau GIF.')
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setSelectedFile(null)
      event.target.value = ''
      setError('Ukuran foto maksimal 5 MB.')
      return
    }
    setSelectedFile(file)
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setMessage(null)
    setError(null)
    let uploadedPath: string | null = null

    try {
      let avatarUrlToSave = avatar || null
      if (selectedFile) {
        const uploadFile = await compressImage(selectedFile)
        uploadedPath = `${userId}/${Date.now()}-${crypto.randomUUID()}.jpg`
        const { error: uploadError } = await supabase.storage
          .from('photo-profile')
          .upload(uploadedPath, uploadFile, { cacheControl: '3600', upsert: false, contentType: 'image/jpeg' })
        if (uploadError) throw new Error(uploadError.message)
        const { data } = supabase.storage.from('photo-profile').getPublicUrl(uploadedPath)
        avatarUrlToSave = data.publicUrl
      }

      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName, avatar_url: avatarUrlToSave }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Gagal menyimpan profile')

      setAvatar(avatarUrlToSave || '')
      setSelectedFile(null)
      setMessage('Profile berhasil diperbarui.')
      router.refresh()
    } catch (submitError) {
      if (uploadedPath) await supabase.storage.from('photo-profile').remove([uploadedPath])
      setError(submitError instanceof Error ? submitError.message : 'Gagal menyimpan profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
      {message && <p className="rounded-lg bg-accent/10 p-3 text-sm text-accent" role="status">{message}</p>}
      {error && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive" role="alert">{error}</p>}
      <div>
        <label htmlFor="full-name" className="mb-2 block text-sm font-medium">Nama lengkap</label>
        <input id="full-name" value={fullName} onChange={(event) => setFullName(event.target.value)} className="min-h-11 w-full rounded-lg border border-border bg-secondary px-4 text-foreground outline-none focus:ring-2 focus:ring-accent" required />
      </div>
      <div>
        <label htmlFor="profile-email" className="mb-2 block text-sm font-medium">Email</label>
        <input id="profile-email" value={email} readOnly className="min-h-11 w-full rounded-lg border border-border bg-muted px-4 text-muted-foreground" />
      </div>
      <div>
        <span className="mb-2 block text-sm font-medium">Foto profil</span>
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border border-border bg-secondary">
            {previewUrl ? <img src={previewUrl} alt="Pratinjau foto profil" className="h-full w-full object-cover" /> : <span className="flex h-full items-center justify-center text-xs text-muted-foreground">Belum ada foto</span>}
          </div>
          <div className="min-w-0 flex-1">
            <label htmlFor="avatar-file" className="inline-flex min-h-11 cursor-pointer items-center rounded-lg border border-border px-4 text-sm font-medium transition hover:border-accent hover:text-accent">
              Pilih foto
              <input id="avatar-file" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleFileChange} disabled={loading} className="sr-only" />
            </label>
            <p className="mt-2 text-xs text-muted-foreground">JPG, PNG, WEBP, atau GIF · otomatis dikompres maksimal 900 KB</p>
          </div>
        </div>
      </div>
      <button type="submit" disabled={loading} className="min-h-11 w-full rounded-lg bg-accent px-4 font-semibold text-on-accent transition hover:bg-accent/90 disabled:opacity-50">{loading ? 'Mengunggah dan menyimpan...' : 'Simpan perubahan'}</button>
    </form>
  )
}
