import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { CheckCircle, XCircle, Timer, BarChart3, Home, RefreshCw, Clock } from 'lucide-react'
import { notFound } from 'next/navigation'
import RefreshResultButton from '@/components/exam/RefreshResultButton'
import UserHeader from '@/components/user/UserHeader'
import RichTextContent from '@/components/editor/RichTextContent'

interface ExamAttempt {
  id: string
  user_id: string
  exam_id: string
  started_at: string
  submitted_at: string | null
  score: number | null
  is_passed: boolean | null
  status: string
}

interface Question {
  id: string
  question_text: string
  question_type: string
  options: any[] | null
  order_index?: number
  points?: number | null
  model_answer?: string | null
  rubric?: string | null
}

interface Answer {
  question_id: string
  selected_option: string | null
  answer_text: string | null
  score: number | null
}

export default async function ExamResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ examId: string }>
  searchParams?: Promise<{ attempt?: string }>
}) {
  const { examId } = await params
  const query = searchParams ? await searchParams : {}
  const attemptId = query.attempt
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
          className="px-8 py-4 bg-accent text-on-accent font-semibold rounded-lg hover:bg-accent/90"
        >
          Login untuk melihat hasil
        </Link>
      </div>
    )
  }

  // Load the requested attempt, or the latest graded attempt for this exam.
  let attemptQuery = supabase
    .from('exam_attempts')
    .select('*')
    .eq('user_id', user.id)
    .eq('exam_id', examId)
    .in('status', ['under_review', 'submitted', 'graded'])

  const { data: attempt, error: attemptError } = await (attemptId
    ? attemptQuery.eq('id', attemptId).single()
    : attemptQuery.order('created_at', { ascending: false }).limit(1).single())

  if (!attempt) {
    notFound()
  }

  // Get exam details
  const { data: exam } = await supabase
    .from('exams')
    .select('*')
    .eq('id', examId)
    .single()

  // Get questions
  const { data: questions } = await supabase
    .from('questions')
    .select('id, title, question_text, question_type, options, order_index, points, model_answer, rubric')
    .eq('exam_id', examId)
    .order('order_index', { ascending: true })

  // Get answers for this attempt
  const { data: answers } = await supabase
    .from('answers')
    .select('*')
    .eq('attempt_id', attempt.id)

  const answersMap = answers?.reduce((acc: Record<string, Answer>, a: Answer) => {
    acc[a.question_id] = a
    return acc
  }, {}) || {}

  // Calculate time spent
  const startTime = new Date(attempt.started_at)
  const endTime = attempt.submitted_at ? new Date(attempt.submitted_at) : new Date()
  const timeSpentMs = endTime.getTime() - startTime.getTime()
  const timeSpentMin = Math.floor(timeSpentMs / 60000)
  const timeSpentSec = Math.floor((timeSpentMs % 60000) / 1000)

  const isUnderReview = attempt.status !== 'graded'
  const score = attempt.score ?? 0
  const passed = attempt.is_passed === true
  const passingScore = exam.passing_score

  // Count question stats
  const totalQuestions = questions?.length || 0
  const canShowReview = !isUnderReview
  const canShowCorrectAnswers = canShowReview && exam.show_correct_answers === true
  const canShowIncorrectAnswers = canShowReview && exam.show_incorrect_answers === true
  const correctAnswers = canShowReview ? answers?.filter((a: Answer) => (a.score ?? 0) > 0).length || 0 : 0
  const wrongAnswers = canShowReview ? answers?.filter((a: Answer) => (a.score ?? 0) === 0).length || 0 : 0
  const unanswered = canShowReview ? totalQuestions - (correctAnswers + wrongAnswers) : 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <UserHeader email={user.email} />

      <main className="container mx-auto max-w-4xl px-4 py-6 sm:py-8">
        {/* Result Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-4">
            {isUnderReview ? (
              <Clock className="w-16 h-16 text-muted-foreground" />
            ) : passed ? (
              <CheckCircle className="w-16 h-16 text-accent" />
            ) : (
              <XCircle className="w-16 h-16 text-destructive" />
            )}
          </div>
          <h1 className="text-3xl font-bold mb-2">
            {isUnderReview ? 'Sedang Dinilai' : passed ? 'Selamat! Anda Lulus!' : 'Anda Belum Lulus'}
          </h1>
          <p className="text-muted-foreground">
            {isUnderReview ? 'Hasil akhir akan tampil setelah penilaian selesai.' : <>Nilai Anda: <span className="font-bold text-foreground">{score}</span>/100 (Butuh {passingScore} untuk lulus)</>}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Durasi</p>
            <p className="font-mono text-lg">{timeSpentMin}:{timeSpentSec.toString().padStart(2, '0')} menit</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Total Soal</p>
            <p className="text-2xl font-bold">{totalQuestions}</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Benar</p>
            <p className="text-2xl font-bold text-accent">{correctAnswers}</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Salah</p>
            <p className="text-2xl font-bold text-destructive">{wrongAnswers}</p>
          </div>
        </div>

        {!canShowReview && (
          <div className="card mb-8 border border-accent/30 bg-accent/5 p-5 text-center text-sm text-muted-foreground">
            Jawaban dan nilai akhir akan ditampilkan setelah proses penilaian selesai.
          </div>
        )}

        {/* Score Breakdown */}
        {canShowReview && <div className="card p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Ringkasan Nilai</h2>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Nilai Anda</span>
                <span>{score}/100</span>
              </div>
              <div className="w-full bg-secondary/50 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${score >= passingScore ? 'bg-accent' : 'bg-destructive'}`}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-border">
              <span>Nilai Lulus</span>
              <span className="font-medium">{passingScore}%</span>
            </div>
          </div>
        </div>}

        {/* Answer Review */}
        {canShowReview && <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Review Jawaban</h2>

          <div className="space-y-4">
            {questions?.map((question: Question, index: number) => {
              const answer = answersMap[question.id]
              const score = answer?.score

              return (
                <div
                  key={question.id}
                  className={`min-w-0 max-w-full overflow-hidden rounded-lg border p-4 ${
                    answer && (score ?? 0) > 0
                      ? 'border-green-500/60 bg-green-500/10'
                      : 'border-border bg-card'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-accent">
                      {index + 1}.
                    </span>
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <RichTextContent html={question.question_text} className="mb-2 max-w-full break-words font-medium" />

                      {/* Show user's answer */}
                      {answer && (
                        <div className="mt-3">
                          {question.question_type === 'multiple_choice' || question.question_type === 'true_false' ? (
                            <div className="flex items-center gap-2">
                              {answer.selected_option && (
                                <div className="flex min-w-0 flex-wrap items-center gap-2">
                                  <span className="text-sm text-muted-foreground">
                                    Jawaban Anda:
                                  </span>
                                  <span className={`inline-flex min-w-0 max-w-full flex-wrap items-center gap-1 break-words ${
                                    ((score ?? 0) > 0 && canShowCorrectAnswers) || ((score ?? 0) === 0 && canShowIncorrectAnswers)
                                      ? ((score ?? 0) > 0 ? 'text-accent' : 'text-destructive')
                                      : 'text-foreground'
                                  }`}>
                                    <span className="font-medium">
                                      {question.options?.find(
                                        (o: any) => o.label === answer.selected_option
                                      )?.text || answer.selected_option}
                                    </span>
                                    {((score ?? 0) > 0 && canShowCorrectAnswers) && <CheckCircle className="w-4 h-4" />}
                                    {((score ?? 0) === 0 && canShowIncorrectAnswers) && <XCircle className="w-4 h-4" />}
                                  </span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <span className="text-sm text-muted-foreground">
                                Jawaban Anda:
                              </span>
                              <div className="max-w-full overflow-hidden rounded-lg bg-secondary/30 p-3 text-sm break-words [overflow-wrap:anywhere]">
                                {answer.answer_text ? (
                                  <RichTextContent html={answer.answer_text} className="max-w-full break-words" />
                                ) : (
                                  <span className="text-muted-foreground">Tidak menjawab</span>
                                )}
                              </div>
                              {question.question_type === 'essay' && question.model_answer && canShowCorrectAnswers && (
                                <div className="mt-3 max-w-full overflow-hidden rounded-lg border border-accent/30 bg-accent/5 p-3 text-sm break-words [overflow-wrap:anywhere]">
                                  <p className="mb-2 font-medium text-accent">Jawaban model:</p>
                                  <RichTextContent html={question.model_answer} className="max-w-full break-words" />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {!answer && (
                        <p className="mt-3 text-sm text-muted-foreground">Jawaban tidak tersimpan untuk soal ini.</p>
                      )}

                      {question.question_type === 'essay' && answer && (
                        <div className="mt-3 text-sm text-muted-foreground">
                          Nilai essay: <span className="font-medium text-foreground">{score ?? 0}/{question.points ?? 1}</span>
                        </div>
                      )}

                      {/* Show correct answer for choice-based */}
                      {canShowCorrectAnswers && answer && (question.question_type === 'multiple_choice' || question.question_type === 'true_false') && (
                        <div className="mt-2 text-sm">
                          <span className="text-muted-foreground">Jawaban benar: </span>
                          <span className="text-accent font-medium">
                            {question.options?.find((o: any) => o.is_correct)?.text || question.options?.find((o: any) => o.is_correct)?.label || '-'}
                          </span>
                        </div>
                      )}

                      {canShowIncorrectAnswers && answer && (score ?? 0) === 0 && (
                        <p className="mt-2 text-sm text-destructive">Jawaban Anda belum tepat.</p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
          <Link
            href="/"
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3 font-semibold text-on-accent transition-colors hover:bg-accent/90 sm:w-auto"
          >
            <Home className="w-5 h-5" />
            Kembali ke Beranda
          </Link>
          <RefreshResultButton />
        </div>
      </main>
    </div>
  )
}