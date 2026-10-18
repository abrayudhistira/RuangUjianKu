import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

async function getAdmin() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { supabase, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  const { data: profile } = await (supabase as any).from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { supabase, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  return { supabase }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { supabase, response } = await getAdmin()
  if (response) return response
  const body = await request.json().catch(() => ({}))
  const questions = Array.isArray(body.questions) ? body.questions : []
  if (questions.some((item: any) => typeof item?.id !== 'string' || !Number.isFinite(Number(item.points)) || Number(item.points) < 1)) return NextResponse.json({ error: 'Setiap soal harus memiliki poin minimal 1' }, { status: 400 })

  const { data: existing } = await (supabase as any).from('questions').select('id').eq('exam_id', id)
  const existingIds = new Set((existing || []).map((item: { id: string }) => item.id))
  const nextIds = new Set(questions.map((item: { id: string }) => item.id))
  for (const item of questions) {
    if (existingIds.has(item.id)) {
      const { error } = await (supabase as any).from('questions').update({ points: Number(item.points), order_index: Number(item.order_index) }).eq('id', item.id).eq('exam_id', id)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    } else {
      const { error } = await (supabase as any).from('questions').update({ exam_id: id, points: Number(item.points), order_index: Number(item.order_index) }).eq('id', item.id).is('exam_id', null)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }
  for (const item of existingIds) {
    if (!nextIds.has(item)) {
      const { error } = await (supabase as any).from('questions').update({ exam_id: null, order_index: 0 }).eq('id', item).eq('exam_id', id)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }
  return NextResponse.json({ success: true })
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  return PUT(request, context)
}
