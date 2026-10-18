'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function QuestionAssignment({ examId, questions }: { examId: string; questions: Array<{ id: string; title: string; question_text: string }> }) {
  const router = useRouter()
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  async function assignQuestions() {
    if (!selected.length) return
    setLoading(true)
    const response = await fetch(`/api/admin/exams/${examId}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question_ids: selected }),
    })
    setLoading(false)
    if (response.ok) {
      setSelected([])
      router.refresh()
    } else {
      const result = await response.json().catch(() => ({}))
      alert(result.error || 'Gagal menambahkan soal ke ujian')
    }
  }

  if (!questions.length) return null

  return (
    <section className="card mt-6 p-6">
      <h3 className="text-lg font-semibold">Tambahkan soal dari bank soal</h3>
      <p className="mt-1 text-sm text-muted-foreground">Pilih soal yang akan digunakan dalam ujian ini.</p>
      <div className="mt-4 space-y-2">
        {questions.map((question) => (
          <label key={question.id} className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 hover:bg-secondary">
            <input type="checkbox" checked={selected.includes(question.id)} onChange={(event) => setSelected((current) => event.target.checked ? [...current, question.id] : current.filter((id) => id !== question.id))} className="mt-1 h-4 w-4 accent-accent" />
            <span className="min-w-0"><strong className="block text-sm">{question.title}</strong><span className="block truncate text-sm text-muted-foreground">{question.question_text}</span></span>
          </label>
        ))}
      </div>
      <button type="button" onClick={assignQuestions} disabled={!selected.length || loading} className="mt-4 min-h-11 rounded-lg bg-accent px-4 font-semibold text-on-accent disabled:opacity-50">{loading ? 'Menambahkan...' : `Tambahkan ${selected.length || ''} soal`}</button>
    </section>
  )
}
