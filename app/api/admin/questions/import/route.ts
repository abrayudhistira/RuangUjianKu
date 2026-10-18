import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { parseQuestionMarkdown } from '@/lib/questions/parseQuestionMarkdown'

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: profile } = await (supabase as any).from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json().catch(() => ({}))
  const examId = typeof body.exam_id === 'string' ? body.exam_id : ''
  const markdown = typeof body.markdown === 'string' ? body.markdown : ''
  if (!examId || !markdown) return NextResponse.json({ error: 'exam_id dan markdown wajib diisi' }, { status: 400 })

  const parsed = parseQuestionMarkdown(markdown)
  if (parsed.errors.length) return NextResponse.json({ error: 'Format soal tidak valid', details: parsed.errors }, { status: 422 })
  const rows = parsed.questions.map((question) => ({ ...question, exam_id: examId }))
  const { error } = await (supabase as any).from('questions').insert(rows)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, title: parsed.title, count: rows.length })
}
