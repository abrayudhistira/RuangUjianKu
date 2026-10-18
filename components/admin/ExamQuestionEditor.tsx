'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowDown, ArrowUp, Link2Off, Plus, Save, Trash2 } from 'lucide-react'

type Question = { id: string; title: string; question_text: string; question_type: string; points?: number | null; order_index: number }

export default function ExamQuestionEditor({ examId, assigned, bank }: { examId: string; assigned: Question[]; bank: Question[] }) {
  const router = useRouter()
  const [items, setItems] = useState(assigned.map((item) => ({ ...item, points: item.points || 1 })))
  const [available, setAvailable] = useState(bank)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const totalPoints = useMemo(() => items.reduce((sum, item) => sum + Number(item.points || 0), 0), [items])

  function addQuestion(question: Question) {
    setItems((current) => [...current, { ...question, points: question.points || 1, order_index: current.length }])
    setAvailable((current) => current.filter((item) => item.id !== question.id))
  }

  function removeQuestion(id: string) {
    const item = items.find((question) => question.id === id)
    if (!item) return
    setItems((current) => current.filter((question) => question.id !== id).map((question, index) => ({ ...question, order_index: index })))
    setAvailable((current) => [...current, item])
  }

  function move(index: number, offset: number) {
    const next = index + offset
    if (next < 0 || next >= items.length) return
    const copy = [...items]
    ;[copy[index], copy[next]] = [copy[next], copy[index]]
    setItems(copy.map((item, itemIndex) => ({ ...item, order_index: itemIndex })))
  }

  async function save() {
    setSaving(true)
    setError(null)
    const response = await fetch(`/api/admin/exams/${examId}/questions`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questions: items.map(({ id, points, order_index }) => ({ id, points: Number(points), order_index })) }),
    })
    const result = await response.json().catch(() => ({}))
    if (!response.ok) setError(result.error || 'Gagal menyimpan soal')
    else router.refresh()
    setSaving(false)
  }

  return (
    <section className="card mt-6 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-lg font-semibold">Soal dalam ujian</h3><p className="mt-1 text-sm text-muted-foreground">Atur urutan dan bobot seperti LMS.</p></div><div className="rounded-lg bg-secondary px-3 py-2 text-sm"><span className="text-muted-foreground">Total poin</span><strong className="ml-2">{totalPoints}</strong></div></div>
      {error && <p className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive" role="alert">{error}</p>}
      <div className="mt-5 space-y-3">
        {items.map((item, index) => <div key={item.id} className="rounded-xl border border-border p-4"><div className="flex gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-on-accent">{index + 1}</span><div className="min-w-0 flex-1"><p className="font-medium">{item.title}</p><p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.question_text}</p><div className="mt-3 flex flex-wrap items-center gap-2"><label className="text-xs text-muted-foreground" htmlFor={`points-${item.id}`}>Poin</label><input id={`points-${item.id}`} type="number" min="1" value={item.points} onChange={(event) => setItems((current) => current.map((question) => question.id === item.id ? { ...question, points: Number(event.target.value) } : question))} className="min-h-10 w-24 rounded-lg border border-border bg-secondary px-3 text-sm" /><span className="rounded bg-muted px-2 py-1 text-xs text-muted-foreground">{item.question_type}</span></div></div><div className="flex shrink-0 flex-col gap-1"><button type="button" disabled={index === 0} onClick={() => move(index, -1)} className="rounded p-2 hover:bg-secondary disabled:opacity-30" aria-label="Pindah ke atas"><ArrowUp className="h-4 w-4" /></button><button type="button" disabled={index === items.length - 1} onClick={() => move(index, 1)} className="rounded p-2 hover:bg-secondary disabled:opacity-30" aria-label="Pindah ke bawah"><ArrowDown className="h-4 w-4" /></button><button type="button" onClick={() => removeQuestion(item.id)} className="rounded p-2 text-destructive hover:bg-destructive/10" aria-label="Keluarkan dari ujian"><Link2Off className="h-4 w-4" /></button></div></div></div>)}
        {!items.length && <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">Belum ada soal di ujian ini.</p>}
      </div>
      {available.length > 0 && <div className="mt-6 border-t border-border pt-5"><h4 className="font-medium">Tambahkan dari bank soal</h4><div className="mt-3 space-y-2">{available.map((item) => <div key={item.id} className="flex items-center gap-3 rounded-lg border border-border p-3"><div className="min-w-0 flex-1"><p className="text-sm font-medium">{item.title}</p><p className="truncate text-xs text-muted-foreground">{item.question_text}</p></div><button type="button" onClick={() => addQuestion(item)} className="inline-flex min-h-10 items-center gap-1 rounded-lg bg-accent px-3 text-xs font-semibold text-on-accent"><Plus className="h-3 w-3" />Tambah</button></div>)}</div></div>}
      <button type="button" onClick={save} disabled={saving} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-lg bg-accent px-4 font-semibold text-on-accent disabled:opacity-50"><Save className="h-4 w-4" />{saving ? 'Menyimpan...' : 'Simpan susunan soal'}</button>
    </section>
  )
}
