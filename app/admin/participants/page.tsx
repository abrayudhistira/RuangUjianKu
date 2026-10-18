import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Users, Mail, Calendar, Search } from 'lucide-react'
import AdminHeader from '@/components/admin/AdminHeader'

interface Participant {
  id: string
  email: string
  full_name: string | null
  role: string
  created_at: string
}

export default async function AdminParticipantsPage() {
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

  const { data: participants, error } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'user')
    .order('created_at', { ascending: false })

  const users = participants as Participant[] | null

  // Get attempt count for each user
  const stats: Record<string, { total: number; passed: number }> = {}
  for (const userItem of users || []) {
    const { count: totalAttempts } = await supabase
      .from('exam_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userItem.id)
      .in('status', ['submitted', 'graded'])

    const { count: passedAttempts } = await supabase
      .from('exam_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userItem.id)
      .eq('is_passed', true)

    stats[userItem.id] = {
      total: totalAttempts ?? 0,
      passed: passedAttempts ?? 0,
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Kelola Peserta</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari peserta..."
                className="pl-10 pr-4 py-2 rounded-lg bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        </div>

        <div className="mb-4 text-sm text-muted-foreground">
          Total peserta: <strong>{users?.length || 0}</strong>
        </div>

        {!users || users.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Belum ada peserta terdaftar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium">Nama</th>
                  <th className="text-left py-3 px-4 font-medium">Email</th>
                  <th className="text-center py-3 px-4 font-medium">Ujian Selesai</th>
                  <th className="text-center py-3 px-4 font-medium">Lulus</th>
                  <th className="text-left py-3 px-4 font-medium">Tanggal Daftar</th>
                </tr>
              </thead>
              <tbody>
                {users.map((participant) => {
                  const stat = stats[participant.id] || { total: 0, passed: 0 }
                  return (
                    <tr key={participant.id} className="border-b border-border/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center">
                            <Users className="w-5 h-5 text-accent" />
                          </div>
                          <div>
                            <div className="font-medium">
                              {participant.full_name || '-'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          {participant.email}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">{stat.total}</td>
                      <td className="py-3 px-4 text-center text-accent font-medium">
                        {stat.passed}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(participant.created_at).toLocaleDateString('id-ID')}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}