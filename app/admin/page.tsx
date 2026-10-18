import { createSupabaseServerClient } from '@/lib/supabase/server'
import Link from 'next/link'
import ThemeToggle from '@/components/theme/ThemeToggle'
import ProfileMenu from '@/components/profile/ProfileMenu'
import AdminHeader from '@/components/admin/AdminHeader'
import {
  BookOpen,
  ClipboardList,
  Users,
  BarChart3,
  Plus,
  FileText,
  TrendingUp
} from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Link
          href="/admin/login"
          className="px-8 py-4 bg-accent text-on-accent font-semibold rounded-lg hover:bg-accent/90"
        >
          Login sebagai Admin
        </Link>
      </div>
    )
  }

  const { data: userData } = await (supabase as any)
    .from('users')
    .select('role, full_name, email, avatar_url')
    .eq('id', user.id)
    .single()

  if (userData?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-destructive">Akses ditolak</p>
      </div>
    )
  }

  // Fetch stats
  const [examsResult, questionsResult, usersResult, attemptsResult] = await Promise.all([
    (supabase as any).from('exams').select('*', { count: 'exact', head: true }),
    (supabase as any).from('questions').select('*', { count: 'exact', head: true }),
    (supabase as any).from('users').select('*', { count: 'exact', head: true }),
    (supabase as any).from('exam_attempts').select('*', { count: 'exact', head: true }),
  ])

  const stats = [
    { name: 'Ujian', value: examsResult.count ?? 0, icon: BookOpen },
    { name: 'Soal', value: questionsResult.count ?? 0, icon: ClipboardList },
    { name: 'Peserta', value: usersResult.count ?? 0, icon: Users },
    { name: 'Attempt', value: attemptsResult.count ?? 0, icon: TrendingUp },
  ]

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader name={userData?.full_name} email={userData?.email || user.email} avatarUrl={userData?.avatar_url} />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <h2 className="text-2xl font-bold mb-2">Dashboard Admin</h2>
        <p className="text-muted-foreground mb-8">
          Kelola ujian, soal, dan peserta
        </p>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.name} className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.name}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/50">
                  <stat.icon className="w-6 h-6 text-accent" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Aksi Cepat</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickAction
              title="Buat Ujian Baru"
              icon={<Plus className="w-5 h-5" />}
              href="/admin/exams/new"
            />
            <QuickAction
              title="Tambah Soal"
              icon={<FileText className="w-5 h-5" />}
              href="/admin/questions"
            />
            <QuickAction
              title="Kelola Ujian"
              icon={<BookOpen className="w-5 h-5" />}
              href="/admin/exams"
            />
            <QuickAction
              title="Hasil Ujian"
              icon={<BarChart3 className="w-5 h-5" />}
              href="/admin/results"
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Navigasi</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <NavCard
              title="Ujian"
              description="Kelola semua ujian"
              icon={<BookOpen className="w-8 h-8 text-accent" />}
              href="/admin/exams"
            />
            <NavCard
              title="Soal"
              description="Kelola soal ujian"
              icon={<ClipboardList className="w-8 h-8 text-accent" />}
              href="/admin/questions"
            />
            <NavCard
              title="Peserta"
              description="Lihat daftar peserta"
              icon={<Users className="w-8 h-8 text-accent" />}
              href="/admin/participants"
            />
            <NavCard
              title="Hasil"
              description="Lihat hasil ujian"
              icon={<BarChart3 className="w-8 h-8 text-accent" />}
              href="/admin/results"
            />
          </div>
        </div>
      </main>
    </div>
  )
}

function QuickAction({
  title,
  icon,
  href
}: {
  title: string
  icon: React.ReactNode
  href: string
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-center gap-2 p-4 bg-secondary/30 hover:bg-secondary/50 rounded-lg transition-colors text-center"
    >
      {icon}
      <span className="font-medium">{title}</span>
    </Link>
  )
}

function NavCard({
  title,
  description,
  icon,
  href
}: {
  title: string
  description: string
  icon: React.ReactNode
  href: string
}) {
  return (
    <Link
      href={href}
      className="block p-6 card hover:border-accent/50 transition-colors"
    >
      <div className="flex items-center gap-4">
        {icon}
        <div>
          <h4 className="font-semibold">{title}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </Link>
  )
}
