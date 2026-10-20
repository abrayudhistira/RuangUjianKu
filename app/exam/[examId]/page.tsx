'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import Link from 'next/link'
import { Lock, Timer, CheckCircle, Circle, Save, Send, AlertTriangle } from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import RichTextEditor from '@/components/editor/RichTextEditor'
import RichTextContent from '@/components/editor/RichTextContent'

interface Question {
  id: string
  title: string
  question_text: string
  question_type: 'multiple_choice' | 'short_answer' | 'essay' | 'true_false' | 'matching' | 'dropdown'
  options: any[] | null
  order_index: number
}

interface ExamAttempt {
  id: string
  user_id: string
  exam_id: string
  started_at: string
  submitted_at: string | null
  score: number | null
  participant_name: string | null
  status: 'in_progress' | 'submitted' | 'under_review' | 'graded'
  time_left?: number
}

interface UnlockModalProps {
  isOpen: boolean
  onClose: () => void
  onCancel: () => void
  onSubmit: (key: string) => Promise<boolean>
}

function UnlockModal({ isOpen, onClose, onCancel, onSubmit }: UnlockModalProps) {
  const [key, setKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const success = await onSubmit(key)
      if (success) {
        onClose()
      }
    } catch (err: any) {
      setError(err.message || 'Kunci tidak valid')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="card p-8 w-full max-w-md">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-accent" />
          Buka Kunci Ujian
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Masukkan kunci akses untuk membuka ujian ini.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}
          <input
            type="text"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="Kunci akses"
            autoComplete="off"
          />
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-accent text-on-accent rounded-lg hover:bg-accent/90 disabled:opacity-50"
            >
              {loading ? 'Memverifikasi...' : 'Buka'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ExamPage() {
  const router = useRouter()
  const params = useParams()
  const examId = params.examId as string
  const supabase: any = useMemo(() => createClient(), [])

  const [exam, setExam] = useState<any>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [showUnlockModal, setShowUnlockModal] = useState(false)
  const [showNameModal, setShowNameModal] = useState(false)
  const [participantName, setParticipantName] = useState('')
  const [pendingExamData, setPendingExamData] = useState<any>(null)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [questionOrder, setQuestionOrder] = useState<string[]>([])
  const [questionsLoaded, setQuestionsLoaded] = useState(false)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const submitInFlightRef = useRef(false)
  const unlockCodeRef = useRef<string | undefined>(undefined)
  const initialLoadRef = useRef(true)

  const fetchExamData = useCallback(async (accessCode?: string): Promise<boolean> => {
    setLoading(true)

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return false
    }

    // Fetch exam
    const { data: examData, error: examError } = await supabase
      .from('exams')
      .select('*')
      .eq('id', examId)
      .single()

    if (examError) {
      alert('Ujian tidak ditemukan')
      router.push('/')
      return false
    }

    setExam(examData)

    const { data: profile } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', user.id)
      .single()
    setParticipantName(profile?.full_name || '')

    // Check if exam is within time window first; a locked exam can still be opened
    // during its active window so the participant can enter the access code.

    const now = new Date()
    if (examData.start_time && new Date(examData.start_time) > now) {
      alert('Ujian belum dibuka')
      router.push('/')
      return false
    }
    if (examData.end_time && new Date(examData.end_time) < now) {
      alert('Ujian sudah ditutup')
      router.push('/')
      return false
    }

    // Check the access code before loading any questions. Locked exams must not
    // expose question data until this page has verified the code in this session.
    // Keep unlock state in React memory only. Do not trust localStorage for
    // access control: a stale browser flag would bypass the code modal.
    if (examData.is_locked && !accessCode) {
      setQuestionsLoaded(false)
      setQuestions([])
      setQuestionOrder([])
      setShowUnlockModal(true)
      setLoading(false)
      return false
    }

    // Fetch questions through the protected route. Locked exams require the
    // verified access code in the request header; the database query is never
    // exposed directly to the browser.
    const questionResponse = await fetch(`/api/exams/${examId}/questions`, {
      headers: examData.is_locked ? { 'x-exam-access-code': accessCode || '' } : undefined,
    })
    const questionPayload = await questionResponse.json()

    if (!questionResponse.ok) {
      alert(questionPayload.error || 'Gagal memuat soal')
      setLoading(false)
      return false
    }

    const questionsData = questionPayload.questions || []
    setQuestionsLoaded(true)
    setQuestions(questionsData)
    setQuestionOrder(questionsData.map((q: any) => q.id))

    // Check for existing attempt
    const { data: existingAttempt } = await supabase
      .from('exam_attempts')
      .select('*')
      .eq('user_id', user.id)
      .eq('exam_id', examId)
      .eq('status', 'in_progress')
      .single()

    if (existingAttempt) {
      setAttemptId(existingAttempt.id)
      setParticipantName(existingAttempt.participant_name || profile?.full_name || '')
      setTimeLeft(existingAttempt.time_left || examData.duration_minutes * 60)

      // Load existing answers
      const { data: answersData } = await supabase
        .from('answers')
        .select('*')
        .eq('attempt_id', existingAttempt.id)

      if (answersData) {
        const answersMap: Record<string, any> = {}
        answersData.forEach((a: any) => {
          answersMap[a.question_id] = a.selected_option || a.answer_text
        })
        setAnswers(answersMap)
      }
    } else {
      // Access-code verification succeeded. Pause only for identity confirmation;
      // do not report failure or the unlock modal will reopen in a loop.
      setPendingExamData(examData)
      setShowNameModal(true)
      setShowUnlockModal(false)
      setLoading(false)
      return true
    }

    setLoading(false)
    return true
  }, [supabase, examId, router])

  const handleParticipantNameSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const normalizedName = participantName.trim()
    if (normalizedName.length < 3 || !pendingExamData) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/auth/login')

    const { data: newAttempt, error } = await supabase
      .from('exam_attempts')
      .insert({
        user_id: user.id,
        exam_id: examId,
        participant_name: normalizedName,
        started_at: new Date().toISOString(),
        status: 'in_progress',
        time_left: pendingExamData.duration_minutes * 60,
      })
      .select()
      .single()

    if (error) {
      alert('Gagal memulai ujian')
      return
    }

    setParticipantName(normalizedName)
    setAttemptId(newAttempt.id)
    setTimeLeft(pendingExamData.duration_minutes * 60)
    setPendingExamData(null)
    setShowNameModal(false)
  }

  // Handle unlock key
  const handleUnlockSubmit = async (key: string) => {
    const normalizedKey = key.trim()
    if (!normalizedKey || !exam) return false

    // Let the protected questions endpoint be the source of truth. The client
    // must not decide that a code is valid or hide the modal before loading succeeds.
    unlockCodeRef.current = normalizedKey
    const loaded = await fetchExamData(normalizedKey)
    if (loaded) {
      setIsUnlocked(true)
      // fetchExamData already populated questions and the existing attempt.
      // Keep the modal closed only after that complete load succeeds.
      setShowUnlockModal(false)
      return true
    }

    unlockCodeRef.current = undefined
    return false
  }

  const handleUnlockCancel = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push('/')
    }
  }

  // Save answer
  const saveAnswer = async (questionId: string, value: string) => {
    const newAnswers = { ...answers, [questionId]: value }
    setAnswers(newAnswers)

    if (!attemptId) return

    // Auto-save to database
    await supabase
      .from('answers')
      .upsert({
        attempt_id: attemptId,
        question_id: questionId,
        selected_option: value,
        answer_text: value,
      })
      .eq('attempt_id', attemptId)
      .eq('question_id', questionId)
      .single()
  }

  // Submit exam
  const handleSubmit = async () => {
    if (!attemptId || submitInFlightRef.current) return

    submitInFlightRef.current = true
    setIsSubmitting(true)
    setShowSubmitModal(false)

    const { error } = await supabase
      .from('exam_attempts')
      .update({
        submitted_at: new Date().toISOString(),
        status: 'submitted',
      })
      .eq('id', attemptId)

    if (error) {
      submitInFlightRef.current = false
      setIsSubmitting(false)
      alert('Gagal submit ujian')
      return
    }

    // Trigger auto-grading via API. The in-flight guard prevents duplicate
    // submits when the participant double-clicks or the timer fires concurrently.
    const gradeResponse = await fetch(`/api/exam-attempts/${attemptId}/grade`, {
      method: 'POST',
      headers: { 'Idempotency-Key': attemptId },
    })

    if (!gradeResponse.ok) {
      submitInFlightRef.current = false
      setIsSubmitting(false)
      alert('Jawaban sudah dikirim, tetapi proses penilaian belum selesai. Silakan cek hasil beberapa saat lagi.')
      return
    }

    router.push(`/exam/${examId}/result?attempt=${attemptId}`)
  }

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            handleSubmit()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [timeLeft])

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Initialize
  useEffect(() => {
    if (!initialLoadRef.current) return
    initialLoadRef.current = false
    fetchExamData(unlockCodeRef.current)
  }, [fetchExamData])

  // Save time left periodically
  useEffect(() => {
    if (attemptId && timeLeft > 0) {
      const interval = setInterval(async () => {
        await supabase
          .from('exam_attempts')
          .update({ time_left: timeLeft })
          .eq('id', attemptId)
      }, 10000) // every 10 seconds
      return () => clearInterval(interval)
    }
  }, [attemptId, timeLeft, supabase])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Memuat ujian...</p>
        </div>
      </div>
    )
  }

  if (!exam || !questionsLoaded) {
    if (!showUnlockModal) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <p className="text-muted-foreground">Silakan buka ujian terlebih dahulu.</p>
        </div>
      )
    }
  }

  const currentQuestion = questions[currentQuestionIndex]
  const currentAnswer = answers[currentQuestion?.id || ''] || ''

  const renderAnswerInput = (q: Question) => {
    switch (q.question_type) {
      case 'multiple_choice':
      case 'true_false':
        return (
          <div className="space-y-2 mt-4">
            {q.options?.map((option) => (
              <label
                key={option.label}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 cursor-pointer border border-border"
              >
                <input
                  type="radio"
                  name={`question_${q.id}`}
                  value={option.label}
                  checked={currentAnswer === option.label}
                  onChange={(e) => saveAnswer(q.id, e.target.value)}
                  className="text-accent focus:ring-accent"
                />
                <span className="font-medium">{option.label}</span>
                <span className="flex-1">{option.text}</span>
              </label>
            ))}
          </div>
        )

      case 'dropdown':
        return (
          <select
            value={currentAnswer}
            onChange={(e) => saveAnswer(q.id, e.target.value)}
            className="w-full mt-4 px-4 py-3 rounded-lg bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">Pilih jawaban...</option>
            {q.options?.map((option) => (
              <option key={option.label} value={option.label}>
                {option.text}
              </option>
            ))}
          </select>
        )

      case 'short_answer':
      case 'essay':
        return (
          <div className="mt-4">
            <RichTextEditor
              label={`Jawaban soal ${q.title || q.id}`}
              value={currentAnswer}
              onChange={(value) => saveAnswer(q.id, value)}
              placeholder="Ketik jawaban Anda di sini..."
              minHeight={q.question_type === 'essay' ? '12rem' : '7rem'}
            />
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 shadow-sm backdrop-blur">
        <div className="container mx-auto flex min-h-16 flex-wrap items-center justify-between gap-3 px-4 py-2">
          <Link href="/" className="text-base font-semibold sm:text-lg">Ruang UjianKu</Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex min-h-11 items-center gap-2 rounded-lg bg-accent/10 px-3 text-accent font-mono" aria-label={`Sisa waktu ${formatTime(timeLeft)}`}>
              <Timer className="h-4 w-4" aria-hidden="true" />
              <span className="text-base sm:text-lg">{formatTime(timeLeft)}</span>
            </div>
            <form action="/auth/logout" method="POST">
              <button type="submit" className="min-h-11 px-2 text-sm text-muted-foreground hover:text-foreground sm:px-3">Keluar</button>
            </form>
          </div>
        </div>
      </header>

      {/* Unlock Modal */}
      {showNameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <form onSubmit={handleParticipantNameSubmit} className="card w-full max-w-md space-y-5 p-6 sm:p-8">
            <div>
              <h3 className="text-xl font-semibold">Konfirmasi Identitas Peserta</h3>
              <p className="mt-2 text-sm text-muted-foreground">Nama ini akan dicatat pada hasil ujian.</p>
            </div>
            <div>
              <label htmlFor="participant-name" className="mb-2 block text-sm font-medium">Nama lengkap</label>
              <input id="participant-name" autoFocus required minLength={3} value={participantName} onChange={(event) => setParticipantName(event.target.value)} className="min-h-11 w-full rounded-lg border border-border bg-secondary/50 px-4 py-3" />
            </div>
            <button type="submit" disabled={participantName.trim().length < 3} className="min-h-11 w-full rounded-lg bg-accent px-4 py-3 font-semibold text-on-accent disabled:cursor-not-allowed disabled:opacity-50">Mulai Ujian</button>
          </form>
        </div>
      )}

      <UnlockModal
        isOpen={showUnlockModal}
        onClose={() => undefined}
        onCancel={handleUnlockCancel}
        onSubmit={handleUnlockSubmit}
      />

      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm" role="status" aria-live="polite">
          <div className="card w-full max-w-md p-8 text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-border border-t-accent" aria-hidden="true" />
            <h3 className="text-xl font-semibold">Mengirim jawaban...</h3>
            <p className="mt-2 text-sm text-muted-foreground">Mohon tunggu, jawaban Anda sedang diproses.</p>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {showSubmitModal && !isSubmitting && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="card p-8 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Konfirmasi Submit
            </h3>
            <p className="text-muted-foreground mb-4">
              Anda yakin ingin mengirimkan ujian? Jawaban tidak dapat diubah setelah dikirim.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                disabled={isSubmitting}
                className="min-h-11 px-4 py-2 text-sm text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="min-h-11 px-6 py-2 bg-destructive text-on-destructive font-semibold rounded-lg hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Kirim Ujian
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {exam && questionsLoaded && questions.length > 0 && (
        <main className="container mx-auto px-4 py-8 max-w-5xl">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Soal {currentQuestionIndex + 1} dari {questions.length}</span>
              <span>{questions.filter((q) => answers[q.id]).length} terjawab</span>
            </div>
            <div className="w-full bg-secondary/50 rounded-full h-2">
              <div
                className="bg-accent h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className="card mb-6 p-4 sm:p-8">
            <div className="flex items-start gap-3 mb-6 sm:gap-4">
              <span className="font-mono text-accent text-lg">
                {currentQuestionIndex + 1}.
              </span>
              <h3 className="break-words text-base font-semibold sm:text-lg">
                {currentQuestion.title || 'Pertanyaan'}
              </h3>
            </div>

            <RichTextContent html={currentQuestion.question_text} className="mb-6 text-sm leading-7 text-foreground sm:text-base" />

            {renderAnswerInput(currentQuestion)}

            {/* Auto-save indicator */}
            {answers[currentQuestion.id] && (
              <div className="flex items-center gap-2 text-sm text-accent mt-4">
                <Save className="w-4 h-4" />
                <span>Tersimpan</span>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
              className="min-h-11 w-full rounded-lg px-4 py-2 text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto"
            >
              ← Sebelumnya
            </button>

            {currentQuestionIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
                className="min-h-11 w-full rounded-lg px-4 py-2 text-accent hover:bg-accent/10 sm:w-auto"
              >
                Berikutnya →
              </button>
            ) : (
              <button
                onClick={() => setShowSubmitModal(true)}
                className="min-h-11 w-full rounded-lg bg-accent px-6 py-2 font-semibold text-on-accent transition-colors hover:bg-accent/90 sm:w-auto"
              >
                <Send className="w-4 h-4 inline mr-2" />
                Kirim Ujian
              </button>
            )}
          </div>
        </main>
      )}
    </div>
  )
}