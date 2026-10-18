'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, X } from 'lucide-react'
import { defaultEssayScoringConfig, type EssayScoringConfig } from '@/lib/grading/essaySimilarity'
import AdminToast from './AdminToast'
import RichTextEditor from '@/components/editor/RichTextEditor'

type Option = {
  id?: string
  label: string
  text: string
  is_correct: boolean
}

type Question = {
  id: string
  title: string
  question_text: string
  question_type: 'multiple_choice' | 'short_answer' | 'essay' | 'true_false' | 'matching' | 'dropdown'
  options: Option[] | null
  difficulty: 'easy' | 'medium' | 'hard'
  tags: string[] | null
  order_index: number
  exam_id: string
}

interface QuestionFormProps {
  examId?: string | null
  question?: (Question & {
    points?: number
    section?: string | null
    case_context?: string | null
    correct_answer?: string | null
    model_answer?: string | null
    rubric?: string | null
    essay_scoring_config?: EssayScoringConfig | null
  }) | null
}

export default function QuestionForm({ examId, question }: QuestionFormProps) {
  const router = useRouter()
  const supabase: any = createClient()
  const isEditing = !!question

  const [title, setTitle] = useState(question?.title || '')
  const [questionText, setQuestionText] = useState(question?.question_text || '')
  const [questionType, setQuestionType] = useState(question?.question_type || 'multiple_choice')
  const [difficulty, setDifficulty] = useState(question?.difficulty || 'medium')
  const [tags, setTags] = useState(question?.tags?.join(', ') || '')
  const [options, setOptions] = useState<Option[]>(
    question?.options || [
      { label: 'A', text: '', is_correct: false },
      { label: 'B', text: '', is_correct: false },
      { label: 'C', text: '', is_correct: false },
      { label: 'D', text: '', is_correct: false },
    ]
  )
  const [modelAnswer, setModelAnswer] = useState(question?.model_answer || '')
  const [rubric, setRubric] = useState(question?.rubric || '')
  const [essayScoring, setEssayScoring] = useState<EssayScoringConfig>(question?.essay_scoring_config || defaultEssayScoringConfig)
  const [points, setPoints] = useState(question?.points || (questionType === 'essay' ? 12 : 2))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const questionTypes = [
    { value: 'multiple_choice', label: 'Multiple Choice' },
    { value: 'short_answer', label: 'Short Answer' },
    { value: 'essay', label: 'Essay' },
    { value: 'true_false', label: 'True/False' },
    { value: 'matching', label: 'Matching' },
    { value: 'dropdown', label: 'Dropdown' },
  ]

  const choiceTypes = ['multiple_choice', 'true_false']

  const isChoiceType = choiceTypes.includes(questionType)

  const handleOptionChange = (index: number, field: keyof Option, value: string | boolean) => {
    const newOptions = [...options]
    newOptions[index] = { ...newOptions[index], [field]: value }
    setOptions(newOptions)
  }

  const handleAddOption = () => {
    const labels = options.map((o) => o.label)
    const nextLabel = String.fromCharCode(65 + options.length) // A, B, C...
    setOptions([...options, { label: isChoiceType && questionType === 'true_false'
      ? (labels.includes('Benar') ? 'Salah' : 'Benar')
      : nextLabel, text: '', is_correct: false }])
  }

  const handleRemoveOption = (index: number) => {
    if (options.length <= 1) return
    const newOptions = [...options]
    newOptions.splice(index, 1)
    setOptions(newOptions)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      console.info('[QuestionForm] submitting question', { isEditing, examId: examId || null, questionType })
      const questionData = {
        exam_id: examId || null,
        title,
        question_text: questionText,
        question_type: questionType as Question['question_type'],
        options: isChoiceType ? options : null,
        difficulty,
        tags: tags
          ? tags.split(',').map(t => t.trim()).filter(Boolean)
          : [],
        order_index: question?.order_index || 0,
        points,
        section: question?.section || null,
        case_context: question?.case_context || null,
        correct_answer: questionType === 'multiple_choice' || questionType === 'true_false'
          ? options.find((option) => option.is_correct)?.label || null
          : null,
        model_answer: questionType === 'essay' ? modelAnswer || null : null,
        rubric: questionType === 'essay' ? rubric || null : null,
        essay_scoring_config: questionType === 'essay' ? essayScoring : defaultEssayScoringConfig,
      }

      if (isEditing && question) {
        const { error: updateError } = await supabase
          .from('questions')
          .update(questionData)
          .eq('id', question.id)

        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase
          .from('questions')
          .insert([questionData])

        if (insertError) throw insertError
      }

      console.info('[QuestionForm] question saved successfully')
      setSuccess(true)
    } catch (err: any) {
      console.error('[QuestionForm] failed to save question', err)
      setError(err.message || 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  // Auto-generate options for true/false type
  useEffect(() => {
    if (questionType === 'true_false') {
      setOptions([
        { label: 'Benar', text: 'Benar', is_correct: false },
        { label: 'Salah', text: 'Salah', is_correct: false },
      ])
    } else if (!isChoiceType && options.length > 0) {
      setOptions([])
    }
  }, [questionType])

  return (
    <>
      {success && <AdminToast message={isEditing ? 'Soal berhasil diperbarui.' : 'Soal berhasil ditambahkan.'} onClose={() => { setSuccess(false); router.push('/admin/questions') }} />}
      <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div
          className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            Judul Soal
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="Judul soal (opsional)"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="questionText" className="block text-sm font-medium mb-2">
            Isi Soal
          </label>
          <RichTextEditor
            label="Isi soal"
            value={questionText}
            onChange={setQuestionText}
            placeholder="Tulis isi soal di sini..."
            minHeight="36rem"
          />
        </div>

        <div>
          <label htmlFor="questionType" className="block text-sm font-medium mb-2">
            Tipe Soal
          </label>
          <select
            id="questionType"
            value={questionType}
            onChange={(e) => setQuestionType(e.target.value as Question['question_type'])}
            className="w-full px-4 py-3 rounded-lg bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-accent"
          >
            {questionTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="difficulty" className="block text-sm font-medium mb-2">
            Tingkat Kesulitan
          </label>
          <select
            id="difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Question['difficulty'])}
            className="w-full px-4 py-3 rounded-lg bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="easy">Mudah</option>
            <option value="medium">Sedang</option>
            <option value="hard">Sulit</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="tags" className="block text-sm font-medium mb-2">
            Tags (pisahkan dengan koma)
          </label>
          <input
            id="tags"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="misal: matematika, aljabar, siswa"
          />
        </div>

        {questionType === 'essay' && (
          <div className="md:col-span-2 space-y-4 rounded-lg border border-border p-4">
            <div>
              <label htmlFor="points" className="block text-sm font-medium mb-2">Maksimal Poin</label>
              <input id="points" type="number" min="1" value={points} onChange={(e) => setPoints(Number(e.target.value))} className="w-full rounded-lg border border-border bg-secondary/50 px-4 py-3" />
            </div>
            <div>
              <label htmlFor="modelAnswer" className="block text-sm font-medium mb-2">Jawaban Model</label>
              <RichTextEditor label="Jawaban model" value={modelAnswer} onChange={setModelAnswer} placeholder="Masukkan jawaban acuan untuk penilaian kemiripan..." />
            </div>
            <div>
              <label htmlFor="rubric" className="block text-sm font-medium mb-2">Rubrik Penilaian</label>
              <RichTextEditor label="Rubrik penilaian" value={rubric} onChange={setRubric} placeholder="Jelaskan kriteria jawaban..." minHeight="7rem" />
            </div>
            <label className="flex items-center gap-3 text-sm">
              <input type="checkbox" checked={essayScoring.enabled} onChange={(e) => setEssayScoring({ ...essayScoring, enabled: e.target.checked })} />
              Aktifkan penilaian otomatis berbasis kemiripan
            </label>
            <div>
              <label htmlFor="reviewThreshold" className="block text-sm font-medium mb-2">Batas Review Manual (%)</label>
              <input id="reviewThreshold" type="number" min="0" max="100" value={essayScoring.review_threshold} onChange={(e) => setEssayScoring({ ...essayScoring, review_threshold: Number(e.target.value) })} className="w-full rounded-lg border border-border bg-secondary/50 px-4 py-3" />
              <p className="mt-1 text-xs text-muted-foreground">Jawaban di bawah batas ini ditandai untuk review manual.</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Indikator kemiripan dan poin</p>
              {essayScoring.bands.map((band, index) => (
                <div key={index} className="grid grid-cols-2 gap-2">
                  <input aria-label={`Kemiripan minimum ${index + 1}`} type="number" min="0" max="100" value={band.similarity} onChange={(e) => { const bands = [...essayScoring.bands]; bands[index] = { ...band, similarity: Number(e.target.value) }; setEssayScoring({ ...essayScoring, bands }) }} className="rounded-lg border border-border bg-secondary/50 px-3 py-2" placeholder="Kemiripan %" />
                  <input aria-label={`Poin ${index + 1}`} type="number" min="0" max={points} value={band.points} onChange={(e) => { const bands = [...essayScoring.bands]; bands[index] = { ...band, points: Number(e.target.value) }; setEssayScoring({ ...essayScoring, bands }) }} className="rounded-lg border border-border bg-secondary/50 px-3 py-2" placeholder="Poin" />
                </div>
              ))}
            </div>
          </div>
        )}

        {isChoiceType && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">
              Opsi Jawaban
            </label>
            <div className="space-y-3">
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="w-8 text-center font-medium">{option.label}</span>
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                    required
                    className="flex-1 px-4 py-2 rounded-lg bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder={`Opsi ${option.label}`}
                  />
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={option.is_correct}
                      onChange={() => {
                        const newOptions = options.map((opt, i) => ({
                          ...opt,
                          is_correct: i === index,
                        }))
                        setOptions(newOptions)
                      }}
                      className="text-accent focus:ring-accent"
                    />
                    <span className="text-sm">Benar</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(index)}
                    disabled={options.length <= 1}
                    className="p-1 text-muted-foreground hover:text-destructive rounded disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddOption}
                className="flex items-center gap-2 text-sm text-accent hover:text-accent/80"
              >
                <Plus className="w-4 h-4" />
                Tambah Opsi
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-border">
        <button
          type="button"
          onClick={() => router.push('/admin/questions')}
          className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-accent hover:bg-accent/90 text-on-accent font-semibold rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? 'Menyimpan...' : isEditing ? 'Perbarui' : 'Simpan'}
        </button>
      </div>
      </form>
    </>
  )
}