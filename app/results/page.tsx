import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { CheckCircle, XCircle, Calendar, BarChart3, Clock } from 'lucide-react'
import UserHeader from '@/components/user/UserHeader'

interface Attempt {
  id: string
  exam_id: string
  started_at: string
  submitted_at: string | null
  score: number | null
  is_passed: boolean | null
  status: string
  time_left: number | null
  exams: {
    title: string
    passing_score: number
  } | null
}

export default async function ResultsPage() {
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

  const { data: attempts, error } = await supabase
    .from('exam_attempts')
    .select(`
      *,
      exams!inner(title, passing_score)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const results = attempts as Attempt[] | null

  // Calculate stats
  const totalAttempts = results?.filter((a) => a.status === 'submitted' || a.status === 'graded').length || 0
  const passed = results?.filter((a) => a.is_passed).length || 0
  const failed = results?.filter((a) => a.is_passed === false).length || 0

  return (
    <div className="min-h-screen bg-background">
      <UserHeader email={user.email} />

      <main className="container mx-auto max-w-5xl px-4 py-6 sm:py-8">
        <h2 className="text-2xl font-bold mb-2">Riwayat Hasil</h2>
        <p className="text-muted-foreground mb-8">
          Berikut adalah riwayat ujian yang pernah Anda kerjakan.
        </p>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <BarChart3 className="w-5 h-5 text-accent" />
              <span className="text-sm text-muted-foreground">Total Ujian Selesai</span>
            </div>
            <p className="text-3xl font-bold">{totalAttempts}</p>
          </div>
          <div className="card p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-accent" />
              <span className="text-sm text-muted-foreground">Lulus</span>
            </div>
            <p className="text-3xl font-bold text-accent">{passed}</p>
          </div>
          <div className="card p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <XCircle className="w-5 h-5 text-destructive" />
              <span className="text-sm text-muted-foreground">Tidak Lulus</span>
            </div>
            <p className="text-3xl font-bold text-destructive">{failed}</p>
          </div>
        </div>

        {/* Results Table */}
        {!results || results.length === 0 ? (
          <div className="text-center py-16">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Belum ada riwayat ujian.</p>
            <Link
              href="/"
              className="inline-block mt-4 px-6 py-2 bg-accent text-on-accent rounded-lg hover:bg-accent/90"
            >
              Lihat Ujian Tersedia
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((attempt) => {
              const passed = attempt.is_passed === true
              const isComplete = attempt.status === 'submitted' || attempt.status === 'graded'

              return (
                <div key={attempt.id} className="card p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">
                          {attempt.exams?.title || 'Ujian'}
                        </h3>
                        {isComplete ? (
                          passed ? (
                            <span className="px-2 py-1 bg-accent/10 text-accent rounded-full text-xs font-medium">
                            Lulus
                          </span>
                          ) : (
                            <span className="px-2 py-1 bg-destructive/10 text-destructive rounded-full text-xs font-medium">
                            Tidak Lulus
                          </span>
                          )
                        ) : (
                          <span className="px-2 py-1 bg-muted/50 text-muted-foreground rounded-full text-xs">
                            Dalam Pengerjaan
                          </span>
                        )}
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-3 text-sm min-[360px]:grid-cols-2 md:grid-cols-4">
                        {!isComplete && attempt.time_left !== null && (
                          <div>
                            <span className="text-muted-foreground">Sisa waktu:</span>
                            <span className="font-medium ml-1">
                              {Math.floor(attempt.time_left / 60)}:{String(attempt.time_left % 60).padStart(2, '0')}
                            </span>
                          </div>
                        )}
                        <div>
                          <span className="text-muted-foreground">Nilai:</span>
                          <span className="font-medium ml-1">
                            {attempt.score !== null ? `${attempt.score}/100` : '-'}
                          </span>
                        </div>
                        {attempt.submitted_at && (
                          <div>
                            <span className="text-muted-foreground">Waktu:</span>
                            <span className="font-medium ml-1">
                              {new Date(attempt.submitted_at).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                        )}
                        <div>
                          <span className="text-muted-foreground">Status:</span>
                          <span className="font-medium ml-1">{attempt.status}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Nilai Lulus:</span>
                          <span className="font-medium ml-1">
                            {attempt.exams?.passing_score}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {!isComplete && (
                      <Link
                        href={`/exam/${attempt.exam_id}`}
                        className="ml-4 inline-flex min-h-11 items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-medium text-on-accent transition-colors hover:bg-accent/90"
                      >
                        Lanjutkan Ujian
                      </Link>
                    )}

                    {isComplete && attempt.status === 'graded' && (
                      <Link
                        href={`/exam/${attempt.exam_id}/result?attempt=${attempt.id}`}
                        className="ml-4 px-4 py-2 bg-secondary/50 hover:bg-secondary rounded-lg text-sm font-medium transition-colors"
                      >
                        Detail
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}