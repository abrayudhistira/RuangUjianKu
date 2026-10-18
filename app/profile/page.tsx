import { createSupabaseServerClient } from '@/lib/supabase/server'
import Link from 'next/link'
import ProfileForm from '@/components/profile/ProfileForm'
import BackButton from '@/components/ui/BackButton'

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div className="flex min-h-screen items-center justify-center bg-background"><Link href="/auth/login" className="text-accent">Masuk untuk melanjutkan</Link></div>
  }

  const { data: profile } = await (supabase as any)
    .from('users')
    .select('full_name, email, avatar_url')
    .eq('id', user.id)
    .single()

  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-xl">
        <BackButton fallback="/" />
        <div className="card mt-6 p-6 sm:p-8">
          <h1 className="text-2xl font-bold">Edit Profile</h1>
          <p className="mt-1 text-sm text-muted-foreground">Perbarui informasi profile Anda.</p>
          <ProfileForm
            initialName={profile?.full_name || ''}
            email={profile?.email || user.email || ''}
            avatarUrl={profile?.avatar_url || ''}
            userId={user.id}
          />
        </div>
      </div>
    </main>
  )
}
