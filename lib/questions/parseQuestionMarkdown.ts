export type ParsedQuestion = {
  order_index: number
  title: string
  question_text: string
  question_type: 'multiple_choice' | 'essay'
  options: Array<{ label: string; text: string; is_correct: boolean }> | null
  correct_answer: string | null
  points: number
  section: string | null
  case_context: string | null
  model_answer: string | null
  rubric: string | null
  essay_scoring_config: {
    enabled: boolean
    review_threshold: number
    bands: Array<{ similarity: number; points: number }>
  }
}

export type ParsedQuestionDocument = {
  title: string
  description: string
  questions: ParsedQuestion[]
  errors: string[]
}

const questionHeading = /^(\d+)\.\s+(.+)$/
const optionLine = /^[-*]\s+([A-Z])\.\s+(.+)$/

function cleanMarkdown(value: string) {
  return value.replace(/\*\*(.*?)\*\*/g, '$1').replace(/^>\s?/gm, '').trim()
}

export function parseQuestionMarkdown(markdown: string): ParsedQuestionDocument {
  const lines = markdown.replace(/\r/g, '').split('\n')
  const title = lines.find((line) => line.startsWith('# '))?.slice(2).trim() || 'Ujian baru'
  const description = lines.find((line) => line.startsWith('**') && line.endsWith('**'))?.replace(/^\*\*|\*\*$/g, '').trim() || ''
  const questions: ParsedQuestion[] = []
  const errors: string[] = []
  let section: string | null = null
  let caseContext: string | null = null
  let current: ParsedQuestion | null = null
  let mode: 'question' | 'case' | 'model' | 'rubric' = 'question'
  let buffer: string[] = []

  const flushBuffer = () => {
    if (!current || buffer.length === 0) return
    const text = cleanMarkdown(buffer.join('\n'))
    if (mode === 'model') current.model_answer = text
    else if (mode === 'rubric') current.rubric = text
    else current.question_text = `${current.question_text}\n${text}`.trim()
    buffer = []
  }

  const flushQuestion = () => {
    flushBuffer()
    if (current) questions.push(current)
    current = null
  }

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim()
    if (!line) continue
    if (line.startsWith('### ') || line.startsWith('## ')) {
      if (/Kasus Posisi/i.test(line)) mode = 'case'
      else if (/Soal & Kunci Jawaban Esai/i.test(line)) { section = 'Bagian B – Esai'; mode = 'question' }
      else if (!/Soal & Kunci|Petunjuk|Rekap/i.test(line)) {
        section = line.replace(/^#+\s*/, '').trim()
        mode = 'question'
      }
      continue
    }
    if (mode === 'case' && !line.startsWith('---')) {
      caseContext = `${caseContext ? `${caseContext}\n` : ''}${cleanMarkdown(line)}`
      continue
    }
    const match = line.match(questionHeading)
    if (match) {
      flushQuestion()
      current = {
        order_index: Number(match[1]), title: `Soal ${match[1]}`, question_text: match[2],
        question_type: Number(match[1]) <= 20 ? 'multiple_choice' : 'essay', options: Number(match[1]) <= 20 ? [] : null,
        correct_answer: null, points: Number(match[1]) <= 20 ? 2 : 12, section, case_context: null, model_answer: null, rubric: null,
        essay_scoring_config: { enabled: Number(match[1]) > 20, review_threshold: 60, bands: [{ similarity: 0, points: 0 }, { similarity: 60, points: 6 }, { similarity: 80, points: 9 }, { similarity: 95, points: 12 }] },
      }
      mode = 'question'
      continue
    }
    if (!current) continue
    const option = line.match(optionLine)
    if (option && current.options) {
      current.options.push({ label: option[1], text: option[2], is_correct: false })
      continue
    }
    const key = line.match(/^\*\*Kunci:\*\*\s*([A-Z])$/i)
    if (key && current.options) {
      current.correct_answer = key[1].toUpperCase()
      current.options = current.options.map((item) => ({ ...item, is_correct: item.label === current?.correct_answer }))
      continue
    }
    if (/^\*\*(Contoh Jawaban|Jawaban Model):\*\*/i.test(line)) { flushBuffer(); mode = 'model'; continue }
    if (/^\*Rubrik:/i.test(line)) { flushBuffer(); mode = 'rubric'; buffer.push(line.replace(/^\*Rubrik:\s*/i, '')); continue }
    if (mode === 'question' && current.question_type === 'essay' && caseContext) current.case_context = caseContext
    buffer.push(line)
  }
  flushQuestion()

  for (const question of questions) {
    if (!question.question_text) errors.push(`Soal ${question.order_index}: teks soal kosong`)
    if (question.question_type === 'multiple_choice' && (!question.options?.length || !question.correct_answer)) errors.push(`Soal ${question.order_index}: pilihan atau kunci jawaban tidak lengkap`)
  }
  return { title, description, questions, errors }
}
