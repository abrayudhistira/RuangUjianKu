import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Plus, Edit, Trash2, Lock, Unlock, Copy } from 'lucide-react'
import DeleteButton from '@/components/admin/DeleteButton'
import ThemeToggle from '@/components/theme/ThemeToggle'
import AdminHeader from '@/components/admin/AdminHeader'

interface Exam {
  id: string
  title: string
  description: string | null
  is_locked: boolean
  unlock_key: string | null
  duration_minutes: number
  start_time: string | null
  end_time: string | null
  passing_score: number
  created_at: string
}

async function getExams(supabase: any) {
  const { data, error } = await supabase
    .from('exams')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching exams:', error)
    return []
  }
  return data as Exam[]
}

async function deleteExam(supabase: any, id: string) {
  'use server'
  const { error } = await supabase
    .from('exams')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export default async function AdminExamsPage() {
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

  const exams = await getExams(supabase)
  const now = new Date()

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />

      <main className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Kelola Ujian</h2>
            <p className="text-sm text-muted-foreground mt-1">Buat dan kelola ujian peserta.</p>
          </div>
          <Link
            href="/admin/exams/new"
            className="w-full sm:w-auto px-4 py-3 sm:py-2 bg-accent text-on-accent rounded-lg hover:bg-accent/90 transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <Plus className="w-4 h-4" />
            Buat Ujian Baru
          </Link>
        </div>

        {!exams || exams.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Belum ada ujian. Buat ujian pertama!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {exams.map((exam) => {
              const isPast = exam.end_time && new Date(exam.end_time) < now
              const isFuture = exam.start_time && new Date(exam.start_time) > now
              const status = isFuture
                ? { label: 'Akan dibuka', color: 'text-accent' }
                : isPast
                  ? { label: 'Selesai', color: 'text-muted-foreground' }
                  : { label: 'Aktif', color: 'text-accent' }

              return (
                <div key={exam.id} className="card p-5 sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
                    <Link href={`/admin/exams/${exam.id}`} className="block flex-1 rounded-lg focus-visible:ring-2 focus-visible:ring-accent">
                      <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{exam.title}</h3>
                        <span className={`text-sm ${status.color} font-medium`}>
                          {status.label}
                        </span>
                        {exam.is_locked && (
                          <Lock className="w-4 h-4 text-accent" />
                        )}
                      </div>

                      {exam.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {exam.description}
                        </p>
                      )}

                      <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
                        <span>{exam.duration_minutes} menit</span>
                        <span>Nilai lulus: {exam.passing_score}%</span>
                        {exam.start_time && (
                          <span>Dibuka: {new Date(exam.start_time).toLocaleDateString('id-ID')}</span>
                        )}
                        {exam.end_time && (
                          <span>Ditutup: {new Date(exam.end_time).toLocaleDateString('id-ID')}</span>
                        )}
                      </div>
                      </div>
                    </Link>

                    <div className="flex items-center justify-end gap-2 self-end sm:self-auto">
                      <Link
                        href={`/admin/exams/${exam.id}/edit`}
                        className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary/50 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <DeleteButton
                        action={`/api/exams/${exam.id}`}
                        confirmMessage="Yakin ingin menghapus ujian ini?"
                      />
                    </div>
                  </div>
                </div>
              )
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            })}
          </div>
        )}
      </main>
    </div>
  )
}

// Re-export delete function for use in form
export async function DeleteExamClient({
  examId,
  onDelete
}: {
  examId: string
  onDelete: (id: string) => void
}) {
  return (
    <form
      action={async (formData) => {
        'use server'
        const supabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            cookies: {
              getAll() { return [] },
              setAll() {},
            },
          }
        )
        await deleteExam(supabase, examId)
        onDelete(examId)
      }}
    >
      <button
        type="submit"
        className="p-2 text-muted-foreground hover:text-destructive rounded-lg hover:bg-destructive/10 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </form>
  )
}