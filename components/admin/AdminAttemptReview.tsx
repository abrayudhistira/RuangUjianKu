'use client'

import { useState } from 'react'
import RichTextContent from '@/components/editor/RichTextContent'

type ReviewQuestion = {
  id: string
  title: string
  question_text: string
  question_type: string
  options: any[] | null
  points: number
  model_answer: string | null
  rubric: string | null
  answer: { selected_option: string | null; answer_text: string | null; score: number | null; manual_score: number | null; review_note: string | null; needs_review: boolean } | null
}

export default function AdminAttemptReview({ attemptId, participant, examTitle, questions }: { attemptId: string; participant: string; examTitle: string; questions: ReviewQuestion[] }) {
  const [reviews, setReviews] = useState(() => Object.fromEntries(questions.map((question) => [question.id, { manual_score: question.answer?.manual_score ?? '', review_note: question.answer?.review_note ?? '', needs_review: question.answer?.needs_review ?? false }])))
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  function update(id: string, field: string, value: string | boolean) {
    setReviews((current) => ({ ...current, [id]: { ...current[id], [field]: value } }))
  }

  async function save() {
    setSaving(true)
    setMessage(null)
    const response = await fetch(`/api/admin/attempts/${attemptId}/review`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reviews: questions.map((question) => ({ question_id: question.id, ...reviews[question.id] })) }) })
    const result = await response.json()
    setMessage(response.ok ? `Review tersimpan. Nilai akhir: ${result.score}/100` : result.error || 'Gagal menyimpan review')
    setSaving(false)
  }

  return <div className="space-y-6">
    <div className="card p-6"><p className="text-sm text-muted-foreground">Peserta</p><h1 className="text-2xl font-bold">{participant}</h1><p className="mt-1 text-muted-foreground">{examTitle}</p></div>
    {message && <p role="status" className="rounded-lg bg-accent/10 p-3 text-sm text-accent">{message}</p>}
    {questions.map((question, index) => {
      const review = reviews[question.id]
      return <section key={question.id} className="card min-w-0 overflow-hidden p-5">
        <div className="flex min-w-0 gap-3"><span className="text-accent">{index + 1}.</span><div className="min-w-0 flex-1"><RichTextContent html={question.question_text} className="break-words" />
          <div className="mt-4 rounded-lg bg-secondary/40 p-3"><p className="mb-2 text-sm font-medium">Jawaban peserta</p>{question.answer?.answer_text ? <RichTextContent html={question.answer.answer_text} className="break-words [overflow-wrap:anywhere]" /> : <p className="text-sm text-muted-foreground">Tidak menjawab</p>}</div>
          {question.model_answer && <div className="mt-3 rounded-lg border border-accent/30 bg-accent/5 p-3"><p className="mb-2 text-sm font-medium text-accent">Jawaban model</p><RichTextContent html={question.model_answer} className="break-words [overflow-wrap:anywhere]" /></div>}
          {question.rubric && <div className="mt-3 rounded-lg border border-border p-3"><p className="mb-2 text-sm font-medium">Rubrik</p><RichTextContent html={question.rubric} className="break-words [overflow-wrap:anywhere]" /></div>}
          <div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="text-sm">Nilai manual (maks. {question.points})<input type="number" min="0" max={question.points} step="1" value={review.manual_score} onChange={(event) => update(question.id, 'manual_score', event.target.value)} className="mt-1 min-h-11 w-full rounded-lg border border-border bg-background px-3" placeholder="Kosong = otomatis" /></label><label className="text-sm">Catatan reviewer<textarea value={review.review_note} onChange={(event) => update(question.id, 'review_note', event.target.value)} className="mt-1 min-h-11 w-full rounded-lg border border-border bg-background p-3" /></label></div>
          <label className="mt-3 flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={review.needs_review} onChange={(event) => update(question.id, 'needs_review', event.target.checked)} /> Tandai perlu ditinjau</label>
        </div></div>
      </section>
    })}
    <button type="button" onClick={save} disabled={saving} className="min-h-11 w-full rounded-lg bg-accent px-4 font-semibold text-on-accent disabled:opacity-50">{saving ? 'Menyimpan review...' : 'Simpan review dan nilai'}</button>
  </div>
}
