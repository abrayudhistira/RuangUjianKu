import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
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
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { exam_id } = body

    if (!exam_id) {
      return NextResponse.json({ error: 'exam_id is required' }, { status: 400 })
    }

    // Check for existing in-progress attempt
    const { data: existingAttempt } = await supabase
      .from('exam_attempts')
      .select('*')
      .eq('user_id', user.id)
      .eq('exam_id', exam_id)
      .eq('status', 'in_progress')
      .single()

    if (existingAttempt) {
      return NextResponse.json({
        success: true,
        attemptId: existingAttempt.id,
        message: 'Existing attempt found'
      })
    }

    // Get exam to calculate time left
    const { data: exam, error: examError } = await supabase
      .from('exams')
      .select('duration_minutes')
      .eq('id', exam_id)
      .single()

    if (examError) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 })
    }

    // Create new attempt
    const { data: newAttempt, error } = await supabase
      .from('exam_attempts')
      .insert({
        user_id: user.id,
        exam_id,
        started_at: new Date().toISOString(),
        status: 'in_progress',
        time_left: exam.duration_minutes * 60, // in seconds
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      attemptId: newAttempt.id,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}