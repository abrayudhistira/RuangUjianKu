import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Plus, Edit, Trash2, BookOpen, Upload } from 'lucide-react'
import DeleteButton from '@/components/admin/DeleteButton'
import AdminHeader from '@/components/admin/AdminHeader'

interface Question {
  id: string
  title: string
  question_text: string
  question_type: string
  difficulty: string
  tags: string[] | null
  order_index: number
  exam_id: string
  exams: {
    title: string
  } | null
}

interface Exam {
  id: string
  title: string
}

export default async function AdminQuestionsPage() {
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

  const { data: userData } = await supabase
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

  const [examsRes, questionsRes] = await Promise.all([
    supabase
      .from('exams')
      .select('id, title')
      .order('title'),
    supabase
      .from('questions')
      .select('*, exams(title, id)')
      .order('created_at', { ascending: false }),
  ])

  const exams = examsRes.data as Exam[] | null
  const questions = questionsRes.data as Question[] | null

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Kelola Soal</h2>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/questions/import"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm hover:bg-secondary"
            >
              <Upload className="w-4 h-4" />
              Import Soal
            </Link>
            <Link
              href="/admin/questions/new"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm text-on-accent hover:bg-accent/90"
            >
              <Plus className="w-4 h-4" />
              Tambah Soal
            </Link>
          </div>
        </div>

        {/* Exam Filter */}
        <div className="mb-6">
          <Link
            href="/admin/questions"
            className="text-sm text-accent hover:underline"
          >
            Semua ujian ({questions?.length || 0})
          </Link>
          {exams && (
            <div className="flex flex-wrap gap-2 mt-3">
              {exams.map((exam) => {
                const count = questions?.filter((q) => q.exam_id === exam.id).length || 0
                return (
                  <Link
                    key={exam.id}
                    href={`/admin/questions?exam=${exam.id}`}
                    className="px-3 py-1.5 rounded-lg bg-secondary/50 hover:bg-secondary/70 text-sm transition-colors flex items-center gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    {exam.title} ({count})
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Questions Table */}
        {!questions || questions.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Belum ada soal. Klik "Tambah Soal" untuk mulai.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium">Judul</th>
                  <th className="text-left py-3 px-4 font-medium">Tipe</th>
                  <th className="text-left py-3 px-4 font-medium">Kesulitan</th>
                  <th className="text-left py-3 px-4 font-medium">Ujian</th>
                  <th className="text-right py-3 px-4 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((question) => (
                  <tr key={question.id} className="border-b border-border/50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium">{question.title || question.question_text.slice(0, 50) + '...'}</div>
                        <div className="text-sm text-muted-foreground max-w-md truncate">
                          {question.question_text}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-secondary/50 rounded text-xs">
                        {getQuestionTypeLabel(question.question_type)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                        {getDifficultyLabel(question.difficulty)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {question.exams?.title || '-'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/questions/${question.id}/edit`}
                          className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-secondary/50 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <DeleteButton
                          action={`/api/questions/${question.id}`}
                          confirmMessage="Yakin ingin menghapus soal ini?"
                          method="post"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}

function getQuestionTypeLabel(type: string) {
  const labels: Record<string, string> = {
    multiple_choice: 'Multiple Choice',
    short_answer: 'Short Answer',
    essay: 'Essay',
    true_false: 'True/False',
    matching: 'Matching',
    dropdown: 'Dropdown',
  }
  return labels[type] || type
}

function getDifficultyLabel(level: string) {
  const labels: Record<string, string> = {
    easy: 'Mudah',
    medium: 'Sedang',
    hard: 'Sulit',
  }
  return labels[level] || level
}

function getDifficultyColor(level: string) {
  const colors: Record<string, string> = {
    easy: 'text-green-400',
    medium: 'text-yellow-400',
    hard: 'text-red-400',
  }
  return colors[level] || 'text-muted-foreground'
}