'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminToast from './AdminToast'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'

type Exam = {
  id: string
  title: string
  description: string | null
  is_locked: boolean
  unlock_key: string | null
  duration_minutes: number
  start_time: string | null
  end_time: string | null
  passing_score: number
}

interface ExamFormProps {
  exam?: Exam | null
}

export default function ExamForm({ exam }: ExamFormProps) {
  const router = useRouter()
  const supabase: any = createClient()
  const isEditing = !!exam

  const [title, setTitle] = useState(exam?.title || '')
  const [description, setDescription] = useState(exam?.description || '')
  const [isLocked, setIsLocked] = useState(exam?.is_locked ?? true)
  const [unlockKey, setUnlockKey] = useState(exam?.unlock_key || '')
  const [duration, setDuration] = useState(exam?.duration_minutes || 60)
  const [startTime, setStartTime] = useState(
    exam?.start_time ? new Date(exam.start_time).toISOString().slice(0, 16) : ''
  )
  const [endTime, setEndTime] = useState(
    exam?.end_time ? new Date(exam.end_time).toISOString().slice(0, 16) : ''
  )
  const [passingScore, setPassingScore] = useState(exam?.passing_score || 60)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const toDatabaseTimestamp = (value: string) => value ? new Date(value).toISOString() : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const examData = {
        title,
        description: description || null,
        is_locked: isLocked,
        unlock_key: isLocked ? unlockKey : null,
        duration_minutes: duration,
        start_time: toDatabaseTimestamp(startTime),
        end_time: toDatabaseTimestamp(endTime),
        passing_score: passingScore,
      }

      if (isEditing && exam) {
        const { error: updateError } = await supabase
          .from('exams')
          .update(examData)
          .eq('id', exam.id)

        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase
          .from('exams')
          .insert([examData])

        if (insertError) throw insertError
      }

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
      {success && <AdminToast message={isEditing ? 'Ujian berhasil diperbarui.' : 'Ujian berhasil ditambahkan.'} onClose={() => { setSuccess(false); router.push('/admin/exams') }} />}
      <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div
          className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            Judul Ujian
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full min-h-11 px-4 py-3 rounded-lg bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="Masukkan judul ujian"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium mb-2">
            Petunjuk Ujian
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 rounded-lg bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-accent resize-none"
            placeholder="Tulis petunjuk ujian, aturan, dan informasi penting lainnya..."
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            id="isLocked"
            type="checkbox"
            checked={isLocked}
            onChange={(e) => setIsLocked(e.target.checked)}
            className="w-4 h-4 rounded bg-secondary/50 border-border text-accent focus:ring-accent"
          />
          <label htmlFor="isLocked" className="text-sm font-medium">
            Kunci ujian (butuh kunci akses)
          </label>
        </div>

        {isLocked && (
          <div>
            <label htmlFor="unlockKey" className="block text-sm font-medium mb-2">
              Kunci Akses
            </label>
            <input
              id="unlockKey"
              type="text"
              value={unlockKey}
              onChange={(e) => setUnlockKey(e.target.value)}
              required={isLocked}
              className="w-full min-h-11 px-4 py-3 rounded-lg bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="Masukkan kunci akses"
            />
          </div>
        )}

        <div>
          <label htmlFor="duration" className="block text-sm font-medium mb-2">
            Durasi (menit)
          </label>
          <input
            id="duration"
            type="number"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
            required
            min={1}
            className="w-full min-h-11 px-4 py-3 rounded-lg bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div>
          <label htmlFor="passingScore" className="block text-sm font-medium mb-2">
            Nilai Lulus (%)
          </label>
          <input
            id="passingScore"
            type="number"
            value={passingScore}
            onChange={(e) => setPassingScore(parseInt(e.target.value) || 0)}
            required
            min={0}
            max={100}
            className="w-full min-h-11 px-4 py-3 rounded-lg bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div>
          <label htmlFor="startTime" className="block text-sm font-medium mb-2">
            Dibuka Pada
          </label>
          <input
            id="startTime"
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full min-h-11 px-4 py-3 rounded-lg bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div>
          <label htmlFor="endTime" className="block text-sm font-medium mb-2">
            Ditutup Pada
          </label>
          <input
            id="endTime"
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full min-h-11 px-4 py-3 rounded-lg bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-6 border-t border-border">
        <button
          type="button"
          onClick={() => router.push('/admin/exams')}
          className="w-full sm:w-auto px-4 py-3 sm:py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-6 py-3 sm:py-2 bg-accent hover:bg-accent/90 text-on-accent font-semibold rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? 'Menyimpan...' : isEditing ? 'Perbarui' : 'Simpan'}
        </button>
      </div>
      </form>
    </>
  )
}