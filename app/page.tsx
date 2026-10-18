import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import UserHeader from '@/components/user/UserHeader'
import ThemeToggle from '@/components/theme/ThemeToggle'
import ProfileMenu from '@/components/profile/ProfileMenu'

interface Exam {
  id: string
  title: string
  description: string | null
  is_locked: boolean
  duration_minutes: number
  start_time: string | null
  end_time: string | null
}

interface InProgressAttempt {
  id: string
  exam_id: string
  time_left: number | null
  answered_count: number
}

export default async function HomePage() {
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Link
          href="/auth/login"
          className="px-8 py-4 bg-accent text-on-accent font-semibold rounded-lg hover:bg-accent/90 transition-colors"
        >
          Masuk untuk Memulai
        </Link>
      </div>
    )
  }

  // Check if user is admin
  const { data: userData } = await supabase
    .from('users')
    .select('role, full_name, email, avatar_url')
    .eq('id', user.id)
    .single()

  if (userData?.role === 'admin') {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold">Ruang UjianKu</h1>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <ProfileMenu name={userData?.full_name} email={userData?.email || user.email} avatarUrl={userData?.avatar_url} />
              <Link
                href="/admin"
                className="px-4 py-2 bg-accent text-on-accent rounded-lg hover:bg-accent/90 transition-colors"
              >
                Dashboard Admin →
              </Link>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold mb-4">Selamat datang, Admin</h2>
          <p className="text-muted-foreground">
            Kelola ujian, soal, dan peserta dari panel admin.
          </p>
        </main>
      </div>
    )
  }

  // Fetch available exams for regular user
  const { data: exams, error } = await supabase
    .from('exams')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: attempts } = await supabase
    .from('exam_attempts')
    .select('id, exam_id, time_left')
    .eq('user_id', user.id)
    .eq('status', 'in_progress')

  const attemptIds = (attempts || []).map((attempt) => attempt.id)
  const { data: savedAnswers } = attemptIds.length
    ? await supabase.from('answers').select('attempt_id').in('attempt_id', attemptIds)
    : { data: [] }
  const { data: examQuestions } = await supabase.from('questions').select('exam_id')
  const questionCountByExam = new Map<string, number>()
  ;(examQuestions || []).forEach((question) => {
    questionCountByExam.set(question.exam_id, (questionCountByExam.get(question.exam_id) || 0) + 1)
  })

  const inProgressByExam = new Map<string, InProgressAttempt>()
  ;(attempts || []).forEach((attempt) => {
    const answeredCount = (savedAnswers || []).filter((answer) => answer.attempt_id === attempt.id).length
    inProgressByExam.set(attempt.exam_id, { ...attempt, answered_count: answeredCount })
  })

  const getExamStatus = (exam: Exam) => {
    if (exam.start_time && new Date(exam.start_time) > new Date()) {
      return { label: 'Belum dibuka', color: 'text-muted-foreground' }
    }
    if (exam.end_time && new Date(exam.end_time) < new Date()) {
      return { label: 'Tutup', color: 'text-destructive' }
    }
    if (exam.is_locked) {
      return { label: 'Terkunci', color: 'text-accent' }
    }
    return { label: 'Buka', color: 'text-accent' }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <UserHeader name={userData?.full_name} email={userData?.email || user.email} avatarUrl={userData?.avatar_url} />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Daftar Ujian</h2>
          <p className="text-muted-foreground">
            Berikut adalah daftar ujian yang tersedia untuk Anda.
          </p>
        </div>

        {error && (
          <p className="text-destructive mb-4">
            Error: {error.message}
          </p>
        )}

        {!exams || exams.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Belum ada ujian tersedia.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {exams.map((exam) => {
              const status = getExamStatus(exam)
              const activeAttempt = inProgressByExam.get(exam.id)
              const questionCount = questionCountByExam.get(exam.id) || 0
              const progressPercent = activeAttempt
                ? Math.min(100, Math.round((activeAttempt.answered_count / Math.max(1, questionCount)) * 100))
                : 0
              return (
                <div key={exam.id} className="card p-6">
                  <h3 className="text-lg font-semibold mb-2">{exam.title}</h3>
                  {exam.description && (
                    <p className="text-sm text-muted-foreground mb-4">
                      {exam.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${status.color}`}>
                      {status.label}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {exam.duration_minutes} menit
                    </span>
                  </div>

                  {activeAttempt && (
                    <div className="mt-4 space-y-2" aria-label={`Progress ujian ${progressPercent}%`}>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Progress pengerjaan</span>
                        <span>{activeAttempt.answered_count}/{questionCount} soal</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary/50">
                        <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${progressPercent}%` }} />
                      </div>
                    </div>
                  )}

                  {(!exam.start_time || new Date(exam.start_time) <= new Date()) &&
                  (!exam.end_time || new Date(exam.end_time) >= new Date()) ? (
                    <Link
                      href={`/exam/${exam.id}`}
                      className="mt-4 block min-h-11 w-full rounded-lg bg-accent px-4 py-3 text-center font-medium text-on-accent transition-colors hover:bg-accent/90"
                    >
                      {activeAttempt ? 'Lanjutkan Ujian' : exam.is_locked ? 'Masukkan Kode Ujian' : 'Mulai Ujian'}
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="mt-4 block w-full py-2 px-4 bg-muted text-muted-foreground font-medium rounded-lg text-center"
                    >
                      {new Date(exam.start_time || '') > new Date() ? 'Belum Dibuka' : 'Ujian Ditutup'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

function LogoutButton() {
  return (
    <form action="/auth/logout" method="POST">
      <button
        type="submit"
        className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        Keluar
      </button>
    </form>
  )
}