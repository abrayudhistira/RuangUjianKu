import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

function csv(value: unknown) {
  const text = value == null ? '' : String(value)
  return `"${text.replace(/"/g, '""')}"`
}

export async function GET(request: NextRequest) {
  const examId = new URL(request.url).searchParams.get('exam')
  if (!examId) return NextResponse.json({ error: 'exam wajib dipilih' }, { status: 400 })
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: profile } = await (supabase as any).from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { data: exam } = await (supabase as any).from('exams').select('title').eq('id', examId).single()
  if (!exam) return NextResponse.json({ error: 'Ujian tidak ditemukan' }, { status: 404 })
  const { data: attempts, error } = await (supabase as any).from('exam_attempts').select('id, participant_name, status, score, is_passed, started_at, submitted_at, users(email, full_name)').eq('exam_id', examId).order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const rows = [['Nama peserta', 'Email', 'Ujian', 'Attempt ID', 'Status', 'Nilai', 'Lulus', 'Mulai', 'Dikumpulkan']]
  for (const attempt of attempts || []) {
    const status = attempt.status === 'under_review' || attempt.status === 'submitted'
      ? 'Sedang Dinilai'
      : attempt.status === 'graded' && attempt.is_passed === true
        ? 'Lulus'
        : attempt.status === 'graded'
          ? 'Tidak Lulus'
          : 'Dalam Pengerjaan'
    rows.push([attempt.participant_name || attempt.users?.full_name || '', attempt.users?.email || '', exam.title, attempt.id, status, attempt.score ?? '', attempt.is_passed === true ? 'Ya' : attempt.is_passed === false ? 'Tidak' : '', attempt.started_at, attempt.submitted_at || ''])
  }
  const body = '﻿' + rows.map((row) => row.map(csv).join(',')).join('\r\n') + '\r\n'
  return new NextResponse(body, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="hasil-${examId}.csv"`, 'Cache-Control': 'no-store' } })
}
