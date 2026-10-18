import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import QuestionForm from '@/components/admin/QuestionForm'

interface Exam {
  id: string
  title: string
}

export default async function NewQuestionPage() {
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

  // Questions are created in the shared bank first, then assigned to an exam later.
  const exams = []
  const defaultExamId = null

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
        <h2 className="text-2xl font-bold mb-6">Tambah Soal Baru</h2>

        <p className="mb-4 text-sm text-muted-foreground">
          Soal akan disimpan di bank soal dan dapat ditambahkan ke ujian dari halaman edit ujian.
        </p>

        <div className="card p-6">
          <QuestionForm examId={defaultExamId} />
        </div>
      </main>
    </div>
  )
}