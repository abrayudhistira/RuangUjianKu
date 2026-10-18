import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const accessCode = request.headers.get('x-exam-access-code')
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    },
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: exam, error: examError } = await supabase
    .from('exams')
    .select('id, is_locked, unlock_key')
    .eq('id', id)
    .single()

  if (examError || !exam) return NextResponse.json({ error: 'Exam not found' }, { status: 404 })
  if (exam.is_locked && (!accessCode || accessCode !== exam.unlock_key)) {
    return NextResponse.json({ error: 'Valid exam access code required' }, { status: 403 })
  }

  const { data: questions, error } = await supabase
    .from('questions')
    .select('id, title, question_text, question_type, options, order_index, points')
    .eq('exam_id', id)
    .order('order_index', { ascending: true })

  if (error) return NextResponse.json({ error: 'Failed to load questions' }, { status: 500 })
  return NextResponse.json({ questions })
}
