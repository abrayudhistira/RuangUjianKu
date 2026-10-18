import { notFound, redirect } from 'next/navigation'
import AdminHeader from '@/components/admin/AdminHeader'
import AdminAttemptReview from '@/components/admin/AdminAttemptReview'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export default async function AdminAttemptResultPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')
  const { data: profile } = await (supabase as any).from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/')

  const { data: attempt } = await (supabase as any).from('exam_attempts').select('id, exam_id, users(email, full_name), exams(title)').eq('id', attemptId).single()
  if (!attempt) notFound()
  const { data: questions } = await (supabase as any).from('questions').select('id, title, question_text, question_type, options, points, model_answer, rubric, order_index').eq('exam_id', attempt.exam_id).order('order_index', { ascending: true })
  const { data: answers } = await (supabase as any).from('answers').select('question_id, selected_option, answer_text, score, manual_score, review_note, needs_review').eq('attempt_id', attemptId)
  const answerMap = new Map((answers || []).map((answer: any) => [answer.question_id, answer]))
  const reviewQuestions = (questions || []).map((question: any) => ({ ...question, answer: answerMap.get(question.id) || null }))
  return <div className="min-h-screen bg-background"><AdminHeader /><main className="container mx-auto max-w-4xl px-4 py-8"><AdminAttemptReview attemptId={attemptId} participant={attempt.users?.full_name || attempt.users?.email || '-'} examTitle={attempt.exams?.title || '-'} questions={reviewQuestions} /></main></div>
}
