import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  const { attemptId } = await params
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
    // Verify the attempt belongs to this user
    const { data: attempt, error: attemptError } = await supabase
      .from('exam_attempts')
      .select('*')
      .eq('id', attemptId)
      .eq('user_id', user.id)
      .single()

    if (attemptError || !attempt) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 })
    }

    if (attempt.status !== 'in_progress') {
      return NextResponse.json({ error: 'Attempt already submitted' }, { status: 400 })
    }

    const { data: exam } = await (supabase as any)
      .from('exams')
      .select('grading_mode')
      .eq('id', attempt.exam_id)
      .single()

    // Keep every submitted attempt under review until grading is finalized.
    const { error } = await (supabase as any)
      .from('exam_attempts')
      .update({
        submitted_at: new Date().toISOString(),
        score: null,
        is_passed: null,
        status: 'under_review',
      })
      .eq('id', attemptId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Trigger grading only when this exam is configured for automatic scoring.
    if (exam?.grading_mode !== 'manual') {
      fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/exam-attempts/${attemptId}/grade`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      }).catch((err) => console.error('Grading failed:', err))
    }

    return NextResponse.json({
      success: true,
      message: 'Exam submitted successfully',
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}