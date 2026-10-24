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
  console.log('[AdminReview] request received', {
    attemptId,
    reviewCount: Array.isArray(body?.reviews) ? body.reviews.length : null,
    reviews: Array.isArray(body?.reviews) ? body.reviews.map((review: any) => ({
      questionId: review.question_id,
      manualScore: review.manual_score,
      needsReview: review.needs_review,
    })) : null,
  })
  if (!body || !Array.isArray(body.reviews)) return NextResponse.json({ error: 'reviews wajib berupa array' }, { status: 400 })

  const { data: attempt } = await (supabase as any).from('exam_attempts').select('id, exam_id').eq('id', attemptId).single()
  if (!attempt) return NextResponse.json({ error: 'Attempt tidak ditemukan' }, { status: 404 })

  // Fetch full question data: points, type, options (for auto-grading objective questions)
  const { data: questions } = await (supabase as any).from('questions').select('id, points, question_type, options').eq('exam_id', attempt.exam_id)
  const questionMap = new Map<string, any>((questions || []).map((q: any) => [q.id, q]))
  console.log('[AdminReview] questions loaded', (questions || []).map((question: any) => ({
    questionId: question.id,
    type: question.question_type,
    points: question.points,
    optionCount: Array.isArray(question.options) ? question.options.length : 0,
  })))

  for (const review of body.reviews) {
    if (!questionMap.has(review.question_id)) return NextResponse.json({ error: 'Question tidak sesuai dengan attempt' }, { status: 400 })
    const manualVal = review.manual_score
    if (manualVal !== null && manualVal !== undefined && manualVal !== '') {
      const score = Number(manualVal)
      const maxPoints = Number(questionMap.get(review.question_id)?.points || 1)
      if (!Number.isFinite(score) || score < 0 || score > maxPoints) {
        return NextResponse.json({ error: `Nilai manual tidak valid untuk soal ${review.question_id}` }, { status: 400 })
      }
    }
  }

  const reviewByQuestion = new Map<string, any>()
  for (const review of body.reviews) {
    const manualScore = review.manual_score === null || review.manual_score === '' || review.manual_score === undefined
      ? null
      : Math.round(Number(review.manual_score))
    reviewByQuestion.set(review.question_id, { ...review, manualScore })

    const { data: updatedAnswers, error } = await (supabase as any).from('answers').update({
      manual_score: manualScore,
      review_note: typeof review.review_note === 'string' ? review.review_note.trim() || null : null,
      needs_review: Boolean(review.needs_review),
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    }).eq('attempt_id', attemptId).eq('question_id', review.question_id).select('question_id, manual_score')
    console.log('[AdminReview] answer update', {
      questionId: review.question_id,
      requestedManualScore: manualScore,
      updatedRows: updatedAnswers?.length ?? 0,
      updatedAnswers,
      error: error?.message ?? null,
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!updatedAnswers?.length) {
      const { error: insertError } = await (supabase as any).from('answers').insert({
        attempt_id: attemptId,
        question_id: review.question_id,
        manual_score: manualScore,
        review_note: typeof review.review_note === 'string' ? review.review_note.trim() || null : null,
        needs_review: Boolean(review.needs_review),
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })
      console.log('[AdminReview] answer row created for unanswered question', { questionId: review.question_id, manualScore })
    }
  }

  // Re-read all answers after saving manual scores. Unanswered questions do not
  // have an answer row, so their submitted manual review remains in reviewByQuestion.
  const { data: answers } = await (supabase as any).from('answers').select('question_id, selected_option, score, manual_score').eq('attempt_id', attemptId)
  console.log('[AdminReview] answers after update', (answers || []).map((answer: any) => ({
    questionId: answer.question_id,
    selectedOption: answer.selected_option,
    storedScore: answer.score,
    manualScore: answer.manual_score,
  })))

  // Calculate total using manual_score when present, otherwise auto-grade objective
  // questions on the fly so unreviewed correct answers aren't lost as zero.
  let total = 0
  const calculationRows: Array<Record<string, unknown>> = []
  const answerByQuestion = new Map<string, any>((answers || []).map((answer: any) => [answer.question_id, answer] as [string, any]))
  for (const question of (questions || [])) {
    const answer: any = answerByQuestion.get(question.id)
    const review = reviewByQuestion.get(question.id)

    if (review?.manualScore !== null && review?.manualScore !== undefined) {
      const contribution = Number(review.manualScore)
      total += contribution
      calculationRows.push({ questionId: question.id, source: answer ? 'manual_score' : 'manual_score_without_answer', value: contribution })
      continue
    }

    if (!answer) {
      calculationRows.push({ questionId: question.id, source: 'no_answer', value: 0 })
      continue
    }

    if (answer.manual_score !== null && answer.manual_score !== undefined) {
      const contribution = Number(answer.manual_score)
      total += contribution
      calculationRows.push({ questionId: question.id, source: 'stored_manual_score', value: contribution })
      continue
    }

    if (question.question_type === 'multiple_choice' || question.question_type === 'true_false') {
      const correctOption = question.options?.find((o: any) => o.is_correct)
      if (correctOption && answer.selected_option === correctOption.label) {
        const autoScore = Number(question.points || 1)
        total += autoScore
        calculationRows.push({ questionId: question.id, source: 'auto_correct', value: autoScore })
        await (supabase as any).from('answers').update({ score: autoScore }).eq('attempt_id', attemptId).eq('question_id', question.id)
      } else {
        calculationRows.push({ questionId: question.id, source: 'auto_incorrect', value: 0 })
        await (supabase as any).from('answers').update({ score: 0 }).eq('attempt_id', attemptId).eq('question_id', question.id)
      }
    } else {
      const contribution = Number(answer.score ?? 0)
      total += contribution
      calculationRows.push({ questionId: question.id, source: 'stored_score', value: contribution })
    }
  }

  const max = (questions || []).reduce((sum: number, question: any) => sum + Number(question.points || 1), 0)
  const percentage = max ? Math.round((total / max) * 100) : 0
  console.log('[AdminReview] calculation', { attemptId, rows: calculationRows, total, max, percentage })
  const { data: exam } = await (supabase as any).from('exams').select('passing_score, grading_mode').eq('id', attempt.exam_id).single()
  const { data: updatedAttempt, error: attemptError } = await (supabase as any)
    .from('exam_attempts')
    .update({ score: percentage, is_passed: percentage >= (exam?.passing_score || 0), status: 'graded' })
    .eq('id', attemptId)
    .select('id, score, is_passed, status')
    .maybeSingle()
  console.log('[AdminReview] attempt result update', {
    attemptId,
    requested: { score: percentage, isPassed: percentage >= (exam?.passing_score || 0), status: 'graded' },
    updatedAttempt,
    error: attemptError?.message ?? null,
  })
  if (attemptError) return NextResponse.json({ error: attemptError.message }, { status: 500 })
  if (!updatedAttempt) return NextResponse.json({ error: 'Hasil attempt tidak dapat diperbarui. Pastikan migration policy admin sudah diterapkan.' }, { status: 409 })

  return NextResponse.json({ success: true, score: updatedAttempt.score })
}
