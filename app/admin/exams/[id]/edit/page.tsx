import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import ExamForm from '@/components/admin/ExamForm'
import BackButton from '@/components/ui/BackButton'
import AdminHeader from '@/components/admin/AdminHeader'
import ExamQuestionEditor from '@/components/admin/ExamQuestionEditor'

interface EditExamPageProps {
  params: Promise<{ id: string }>
}

export default async function EditExamPage({ params }: EditExamPageProps) {
  const { id } = await params
  const cookieStore = cookies()
  const cookieStoreResolved: any = await cookieStore

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStoreResolved.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStoreResolved.set(name, value, options)
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Link href="/admin/login" className="text-accent">Masuk sebagai admin</Link>
      </div>
    )
  }

  const { data: userData } = await (supabase as any)
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userData?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive">Akses ditolak</p>
      </div>
    )
  }

  const [{ data: exam }, { data: assignedQuestions }, { data: bankQuestions }] = await Promise.all([
    (supabase as any).from('exams').select('*').eq('id', id).single(),
    (supabase as any).from('questions').select('id, title, question_text, question_type, points, order_index').eq('exam_id', id).order('order_index'),
    (supabase as any).from('questions').select('id, title, question_text, question_type, points, order_index').is('exam_id', null).order('created_at', { ascending: false }),
  ])

  if (!exam) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive">Ujian tidak ditemukan</p>
      </div>
    )
  }

  // Transform exam data for Client Component (serialize dates)
  const examData = {
    id: exam.id,
    title: exam.title,
    description: exam.description,
    is_locked: exam.is_locked,
    unlock_key: exam.unlock_key,
    duration_minutes: exam.duration_minutes,
    start_time: exam.start_time ? new Date(exam.start_time).toLocaleString('sv-SE', { dateStyle: 'short', timeStyle: 'short' }).replace(' ', 'T') : '',
    end_time: exam.end_time ? new Date(exam.end_time).toLocaleString('sv-SE', { dateStyle: 'short', timeStyle: 'short' }).replace(' ', 'T') : '',
    passing_score: exam.passing_score,
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />

      <main className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
        <div className="mb-6">
          <BackButton fallback="/admin/exams" />
          <h2 className="mt-3 text-2xl font-bold">Edit Ujian: {exam.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">Perbarui detail, jadwal, durasi, dan akses ujian.</p>
        </div>

        <div className="card p-6">
          <ExamForm exam={examData} />
        </div>

        <ExamQuestionEditor examId={id} assigned={assignedQuestions || []} bank={bankQuestions || []} />
      </main>
    </div>
  )
}