import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function PATCH(request: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const full_name = typeof body.full_name === 'string' ? body.full_name.trim() : ''
  const avatar_url = typeof body.avatar_url === 'string' ? body.avatar_url.trim() || null : null
  if (!full_name) return NextResponse.json({ error: 'Nama lengkap wajib diisi' }, { status: 400 })
  if (avatar_url && !/^https?:\/\//i.test(avatar_url)) {
    return NextResponse.json({ error: 'URL foto profil tidak valid' }, { status: 400 })
  }

  const { error } = await (supabase as any)
    .from('users')
    .update({ full_name, avatar_url })
    .eq('id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
