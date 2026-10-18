import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Search, Download, BarChart3, Calendar, User } from 'lucide-react'
import AdminHeader from '@/components/admin/AdminHeader'

interface Attempt {
  id: string
  user_id: string
  exam_id: string
  started_at: string
  submitted_at: string | null
  score: number | null
  is_passed: boolean | null
  status: 'in_progress' | 'submitted' | 'graded'
  exams: {
    title: string
    passing_score: number
  } | null
  users: {
    email: string
    full_name: string | null
  } | null
}

export default async function AdminResultsPage() {
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

  const { data: attempts } = await supabase
    .from('exam_attempts')
    .select(`
      *,
      exams!inner(title, passing_score),
      users!inner(email, full_name)
    `)
    .order('created_at', { ascending: false })

  const results = attempts as Attempt[] | null

  // Calculate stats
  const totalAttempts = results?.length || 0
  const passedAttempts = results?.filter((a) => a.is_passed).length || 0
  const passRate = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Hasil Ujian</h2>
          <button className="px-4 py-2 bg-accent text-on-accent rounded-lg hover:bg-accent/90 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Attempt</p>
                <p className="text-2xl font-bold mt-1">{totalAttempts}</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50">
                <BarChart3 className="w-6 h-6 text-accent" />
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Lulus</p>
                <p className="text-2xl font-bold text-accent mt-1">{passedAttempts}</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50">
                <User className="w-6 h-6 text-accent" />
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tingkat Kelulusan</p>
                <p className="text-2xl font-bold mt-1">{passRate}%</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50">
                <BarChart3 className="w-6 h-6 text-accent" />
              </div>
            </div>
          </div>
        </div>

        {/* Results Table */}
        {!results || results.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Belum ada hasil ujian.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium">Peserta</th>
                  <th className="text-left py-3 px-4 font-medium">Ujian</th>
                  <th className="text-center py-3 px-4 font-medium">Nilai</th>
                  <th className="text-center py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Tanggal</th>
                  <th className="text-right py-3 px-4 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {results.map((attempt) => (
                  <tr key={attempt.id} className="border-b border-border/50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium">
                          {attempt.users?.full_name || attempt.users?.email || '-'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {attempt.users?.email}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">{attempt.exams?.title || '-'}</td>
                    <td className="py-3 px-4 text-center">
                      {attempt.score !== null ? `${attempt.score} / 100` : '-'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {attempt.is_passed ? (
                        <span className="px-2 py-1 bg-accent/10 text-accent rounded-full text-xs font-medium">
                          Lulus
                        </span>
                      ) : attempt.is_passed === false ? (
                        <span className="px-2 py-1 bg-destructive/10 text-destructive rounded-full text-xs font-medium">
                          Tidak Lulus
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-muted/50 text-muted-foreground rounded-full text-xs">
                          Belum dinilai
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {attempt.submitted_at
                        ? new Date(attempt.submitted_at).toLocaleDateString('id-ID')
                        : '-'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/admin/results/${attempt.id}`}
                        className="px-3 py-1 text-sm text-accent hover:bg-secondary/50 rounded-lg transition-colors"
                      >
                        Detail
                      </Link>
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