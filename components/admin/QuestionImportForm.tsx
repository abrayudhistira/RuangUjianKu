'use client'

import { useEffect, useState } from 'react'
import AdminToast from './AdminToast'
import { useRouter } from 'next/navigation'

export default function QuestionImportForm() {
  const router = useRouter()
  const [markdown, setMarkdown] = useState('')
  const [examId, setExamId] = useState('')
  const [exams, setExams] = useState<Array<{ id: string; title: string }>>([])
  const [fileName, setFileName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function loadExams() {
    const response = await fetch('/api/admin/exams')
    if (!response.ok) return
    const payload = await response.json()
    setExams(payload.exams || [])
  }

  useEffect(() => {
    loadExams()
  }, [])

  const handleFile = async (file: File) => {
    setFileName(file.name)
    setMarkdown(await file.text())
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)
    try {
      const response = await fetch('/api/admin/questions/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exam_id: examId, markdown }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.details?.join('\n') || payload.error || 'Import gagal')
      setMessage(`${payload.count} soal berhasil diimport.`)
      setSuccess(true)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Import gagal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {success && <AdminToast message="Soal berhasil diimport." onClose={() => setSuccess(false)} />}
      <form onSubmit={handleSubmit} className="card space-y-6 p-6">
      {error && <div role="alert" className="whitespace-pre-line rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
      {message && <div role="status" className="rounded-lg border border-accent/30 bg-accent/10 p-3 text-sm text-accent">{message}</div>}
      <div>
        <label htmlFor="exam" className="mb-2 block text-sm font-medium">Ujian tujuan</label>
        <select id="exam" required value={examId} onChange={(event) => setExamId(event.target.value)} className="w-full rounded-lg border border-border bg-secondary/50 px-4 py-3">
          <option value="">Pilih ujian</option>
          {exams.map((exam) => <option key={exam.id} value={exam.id}>{exam.title}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="file" className="mb-2 block text-sm font-medium">File Markdown</label>
        <input id="file" type="file" accept=".md,text/markdown" required={!markdown} onChange={(event) => event.target.files?.[0] && handleFile(event.target.files[0])} className="w-full rounded-lg border border-border p-3" />
        {fileName && <p className="mt-2 text-sm text-muted-foreground">{fileName}</p>}
      </div>
      <div>
        <label htmlFor="markdown" className="mb-2 block text-sm font-medium">Preview / edit Markdown</label>
        <textarea id="markdown" required value={markdown} onChange={(event) => setMarkdown(event.target.value)} rows={20} className="w-full rounded-lg border border-border bg-secondary/50 px-4 py-3 font-mono text-sm" placeholder="Tempel isi template-soal.md di sini..." />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button type="button" onClick={() => router.push('/admin/questions')} className="min-h-11 rounded-lg px-4 py-2 text-muted-foreground hover:bg-secondary">Batal</button>
        <button type="submit" disabled={loading || !examId || !markdown.trim()} className="min-h-11 rounded-lg bg-accent px-6 py-2 font-semibold text-on-accent disabled:opacity-50">{loading ? 'Mengimport...' : 'Import Soal'}</button>
      </div>
      </form>
    </>
  )
}
