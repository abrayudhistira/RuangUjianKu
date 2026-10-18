import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { calculateEssayScore, defaultEssayScoringConfig } from '@/lib/grading/essaySimilarity'

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

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get the attempt
  const { data: attempt, error: attemptError } = await supabase
    .from('exam_attempts')
    .select('*')
    .eq('id', attemptId)
    .single()

  if (attemptError || !attempt) {
    return NextResponse.json({ error: 'Attempt not found' }, { status: 404 })
  }

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (attempt.user_id !== user.id && profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (attempt.status === 'graded') {
    return NextResponse.json({ success: true, alreadyGraded: true, score: attempt.score, isPassed: attempt.is_passed })
  }

  // Get the exam
  const { data: exam } = await supabase
    .from('exams')
    .select('*')
    .eq('id', attempt.exam_id)
    .single()

  if (!exam) {
    return NextResponse.json({ error: 'Exam not found' }, { status: 404 })
  }

  // Get all questions for this exam
  const { data: questions } = await supabase
    .from('questions')
    .select('*')
    .eq('exam_id', exam.id)

  if (!questions) {
    return NextResponse.json({ error: 'No questions found' }, { status: 404 })
  }

  // Get all answers for this attempt
  const { data: answers } = await supabase
    .from('answers')
    .select('*')
    .eq('attempt_id', attemptId)

  if (!answers) {
    return NextResponse.json({ error: 'No answers found' }, { status: 404 })
  }

  // Auto-grade objective and essay answers using configured question points.
  let totalScore = 0
  const maxScore = questions.reduce((sum: number, question: any) => sum + (question.points || 1), 0)

  for (const question of questions) {
    const answer = answers.find((a: any) => a.question_id === question.id)
    if (!answer) continue

    let questionScore = 0
    if (question.question_type === 'multiple_choice' || question.question_type === 'true_false') {
      const correctOption = question.options?.find((o: any) => o.is_correct)
      questionScore = correctOption && answer.selected_option === correctOption.label ? question.points || 1 : 0
    } else if (question.question_type === 'essay') {
      const essayResult = calculateEssayScore(
        answer.answer_text || '',
        question.model_answer || '',
        question.points || 1,
        question.essay_scoring_config || defaultEssayScoringConfig,
      )
      questionScore = essayResult.points
    }

    totalScore += questionScore
    await supabase.from('answers').update({ score: questionScore }).eq('id', answer.id)
  }

  const percentageScore = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0

  const isPassed = percentageScore >= exam.passing_score

  // Update attempt with final results
  await supabase
    .from('exam_attempts')
    .update({
      score: percentageScore,
      is_passed: isPassed,
      status: 'graded',
    })
    .eq('id', attemptId)

  return NextResponse.json({
    success: true,
    score: percentageScore,
    isPassed,
  })
}