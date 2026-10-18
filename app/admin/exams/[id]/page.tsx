import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { ArrowLeft, Edit, Lock, Plus } from 'lucide-react'
import AdminHeader from '@/components/admin/AdminHeader'

interface PageProps {
  params: Promise<{ id: string }>
}

type Question = {
  id: string
  order_index: number
  title: string
  question_text: string
  question_type: string
  options: Array<{ label: string; text: string; is_correct?: boolean }> | null
  points?: number
  section?: string | null
  case_context?: string | null
  correct_answer?: string | null
  model_answer?: string | null
  rubric?: string | null
}

export default async function ExamDetailPage({ params }: PageProps) {
  const { id } = await params
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: (items) => items.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } },
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return <AccessMessage text="Masuk sebagai admin" href="/admin/login" />
  const { data: profile } = await (supabase as any).from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return <AccessMessage text="Akses ditolak" />

  const [{ data: exam }, { data: questions }] = await Promise.all([
    (supabase as any).from('exams').select('*').eq('id', id).single(),
    (supabase as any).from('questions').select('*').eq('exam_id', id).order('order_index'),
  ])
  if (!exam) return <AccessMessage text="Ujian tidak ditemukan" />

  const grouped = (questions as Question[] || []).reduce<Record<string, Question[]>>((result, question) => {
    const key = question.section || 'Soal Ujian'
    result[key] = [...(result[key] || []), question]
    return result
  }, {})
  const totalPoints = (questions as Question[] || []).reduce((sum, question) => sum + (question.points || 0), 0)

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <main className="mx-auto max-w-5xl px-4 py-6 sm:py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link href="/admin/exams" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-3 text-sm hover:bg-secondary focus-visible:ring-2 focus-visible:ring-accent"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Kembali</Link>
          <div className="flex gap-2">
            <Link href={`/admin/exams/${id}/edit`} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-3 text-sm hover:bg-secondary"><Edit className="h-4 w-4" aria-hidden="true" />Edit ujian</Link>
            <Link href={`/admin/questions/new`} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-accent px-3 text-sm font-semibold text-on-accent hover:bg-accent/90"><Plus className="h-4 w-4" aria-hidden="true" />Bank soal</Link>
          </div>
        </div>

        <article className="paper rounded-sm border border-border bg-card p-5 text-card-foreground shadow-xl sm:p-10">
          <header className="border-b-2 border-card-foreground/30 pb-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Naskah Ujian</p>
            <h1 className="mt-3 font-serif text-2xl font-bold uppercase tracking-wide sm:text-3xl">{exam.title}</h1>
            {exam.description && <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{exam.description}</p>}
            <div className="mt-6 grid grid-cols-2 gap-3 border border-border p-3 text-left text-sm sm:grid-cols-4">
              <Meta label="Durasi" value={`${exam.duration_minutes} menit`} />
              <Meta label="Nilai lulus" value={`${exam.passing_score}%`} />
              <Meta label="Jumlah soal" value={String(questions?.length || 0)} />
              <Meta label="Total poin" value={String(totalPoints)} />
            </div>
            {exam.is_locked && <p className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent"><Lock className="h-4 w-4" aria-hidden="true" />Ujian terkunci</p>}
          </header>

          <section className="mt-8 font-serif text-[15px] leading-7">
            <h2 className="border-b border-border pb-2 text-lg font-bold">Petunjuk Ujian</h2>
            {exam.description ? (
              <p className="mt-4 whitespace-pre-wrap text-muted-foreground">{exam.description}</p>
            ) : (
              <p className="mt-4 text-muted-foreground">Belum ada petunjuk ujian. Tambahkan petunjuk dari halaman edit ujian.</p>
            )}
          </section>

          <div className="mt-10 space-y-10 font-serif">
            {Object.entries(grouped).map(([section, sectionQuestions]) => (
              <section key={section}>
                <h2 className="border-y border-border py-3 text-center text-lg font-bold uppercase tracking-wide">{section}</h2>
                <div className="mt-6 space-y-8">
                  {sectionQuestions.map((question) => <QuestionBlock key={question.id} question={question} />)}
                </div>
              </section>
            ))}
            {!questions?.length && <div className="border border-dashed border-border py-12 text-center"><p className="text-muted-foreground">Belum ada soal pada ujian ini.</p><Link href={`/admin/exams/${id}/edit`} className="mt-3 inline-block text-sm text-accent hover:underline">Tambahkan soal dari bank soal</Link></div>}
          </div>
        </article>
      </main>
    </div>
  )
}

function QuestionBlock({ question }: { question: Question }) {
  return <article className="border-b border-border/70 pb-7">
    <div className="flex items-start justify-between gap-4"><h3 className="font-semibold">{question.order_index}. {question.question_text}</h3><span className="shrink-0 text-xs text-muted-foreground">{question.points || 0} poin</span></div>
    {question.case_context && <div className="mt-4 border-l-4 border-accent bg-muted p-4 text-sm italic"><strong>Kasus:</strong> {question.case_context}</div>}
    {question.options && <ol className="mt-4 space-y-1 pl-7" type="A">{question.options.map((option) => <li key={option.label}>{option.text}</li>)}</ol>}
    <div className="mt-5 rounded border border-accent/40 bg-accent/5 p-4 text-sm print:hidden"><p><strong>Kunci jawaban:</strong> {question.correct_answer || 'Manual review'}</p>{question.model_answer && <p className="mt-2"><strong>Jawaban model:</strong> {question.model_answer}</p>}{question.rubric && <p className="mt-2"><strong>Rubrik:</strong> {question.rubric}</p>}</div>
  </article>
}

function Meta({ label, value }: { label: string; value: string }) { return <div><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 font-semibold">{value}</p></div> }
function AccessMessage({ text, href }: { text: string; href?: string }) { return <div className="flex min-h-screen items-center justify-center bg-background">{href ? <Link href={href} className="text-accent hover:underline">{text}</Link> : <p className="text-destructive">{text}</p>}</div> }
