import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import BackButton from '@/components/ui/BackButton'
import ExamForm from '@/components/admin/ExamForm'

export default async function NewExamPage() {
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

  if (!user || !(await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .eq('role', 'admin')
    .single()
    .then(r => r.data?.role === 'admin'))) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Link href="/admin/login" className="text-accent">Masuk sebagai admin</Link>
      </div>
    )
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

      <main className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
        <div className="mb-6">
          <BackButton fallback="/admin/exams" />
          <h2 className="text-2xl font-bold mt-3">Buat Ujian Baru</h2>
          <p className="text-sm text-muted-foreground mt-1">Atur detail, jadwal, durasi, dan akses ujian.</p>
        </div>

        <div className="card p-4 sm:p-6">
          <ExamForm />
        </div>
      </main>
    </div>
  )
}