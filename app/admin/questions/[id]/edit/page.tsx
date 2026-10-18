import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import QuestionForm from '@/components/admin/QuestionForm'

interface EditQuestionPageProps {
  params: Promise<{ id: string }>
}

export default async function EditQuestionPage({ params }: EditQuestionPageProps) {
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

  const { data: question } = await (supabase as any)
    .from('questions')
    .select('*')
    .eq('id', id)
    .single()

  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive">Soal tidak ditemukan</p>
      </div>
    )
  }

  // Transform question data for Client Component (serialize dates, options)
  const questionData = {
    id: question.id,
    exam_id: question.exam_id,
    title: question.title,
    question_text: question.question_text,
    question_type: question.question_type,
    options: question.options,
    difficulty: question.difficulty,
    tags: question.tags,
    order_index: question.order_index,
    points: question.points,
    section: question.section,
    case_context: question.case_context,
    correct_answer: question.correct_answer,
    model_answer: question.model_answer,
    rubric: question.rubric,
    essay_scoring_config: question.essay_scoring_config,
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/admin" className="text-lg font-semibold">Ruang UjianKu Admin</Link>
          <form action="/auth/logout" method="POST">
            <button type="submit" className="text-sm text-muted-foreground hover:text-foreground">
              Keluar
            </button>
          </form>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h2 className="text-2xl font-bold mb-6">Edit Soal</h2>

        <div className="card p-6">
          <QuestionForm examId={question.exam_id} question={questionData} />
        </div>
      </main>
    </div>
  )
}