import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await (supabase as any).from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json().catch(() => null)
  if (!body || !Array.isArray(body.reviews)) return NextResponse.json({ error: 'reviews wajib berupa array' }, { status: 400 })

  const { data: attempt } = await (supabase as any).from('exam_attempts').select('id, exam_id').eq('id', attemptId).single()
  if (!attempt) return NextResponse.json({ error: 'Attempt tidak ditemukan' }, { status: 404 })

  const { data: questions } = await (supabase as any).from('questions').select('id, points').eq('exam_id', attempt.exam_id)
  const pointsByQuestion = new Map<string, number>((questions || []).map((question: any) => [question.id, Number(question.points || 1)] as [string, number]))

  for (const review of body.reviews) {
    if (!pointsByQuestion.has(review.question_id)) return NextResponse.json({ error: 'Question tidak sesuai dengan attempt' }, { status: 400 })
    if (review.manual_score !== null && review.manual_score !== undefined) {
      const score = Number(review.manual_score)
      if (!Number.isFinite(score) || score < 0 || score > (pointsByQuestion.get(review.question_id) || 0)) {
        return NextResponse.json({ error: `Nilai manual tidak valid untuk soal ${review.question_id}` }, { status: 400 })
      }
    }
  }

  for (const review of body.reviews) {
    const manualScore = review.manual_score === null || review.manual_score === '' || review.manual_score === undefined
      ? null
      : Math.round(Number(review.manual_score))
    const { error } = await (supabase as any).from('answers').update({
      manual_score: manualScore,
      review_note: typeof review.review_note === 'string' ? review.review_note.trim() || null : null,
      needs_review: Boolean(review.needs_review),
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    }).eq('attempt_id', attemptId).eq('question_id', review.question_id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { data: answers } = await (supabase as any).from('answers').select('question_id, score, manual_score').eq('attempt_id', attemptId)
  const total = (answers || []).reduce((sum: number, answer: any) => sum + Number(answer.manual_score ?? answer.score ?? 0), 0)
  const max = (questions || []).reduce((sum: number, question: any) => sum + Number(question.points || 1), 0)
  const percentage = max ? Math.round((total / max) * 100) : 0
  const { data: exam } = await (supabase as any).from('exams').select('passing_score').eq('id', attempt.exam_id).single()
  const { error: attemptError } = await (supabase as any).from('exam_attempts').update({ score: percentage, is_passed: percentage >= (exam?.passing_score || 0), status: 'graded' }).eq('id', attemptId)
  if (attemptError) return NextResponse.json({ error: attemptError.message }, { status: 500 })

  return NextResponse.json({ success: true, score: percentage })
}
