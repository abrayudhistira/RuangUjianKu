export type EssayScoreBand = {
  similarity: number
  points: number
}

export type EssayScoringConfig = {
  enabled: boolean
  review_threshold: number
  bands: EssayScoreBand[]
}

export type EssayScoreResult = {
  similarity: number
  points: number
  needsReview: boolean
}

export const defaultEssayScoringConfig: EssayScoringConfig = {
  enabled: true,
  review_threshold: 60,
  bands: [
    { similarity: 0, points: 0 },
    { similarity: 60, points: 6 },
    { similarity: 80, points: 9 },
    { similarity: 95, points: 12 },
  ],
}

function htmlToText(value: string) {
  return value.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>')
}

function normalize(value: string) {
  return htmlToText(value)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function tokens(value: string) {
  return new Set(normalize(value).split(' ').filter((token) => token.length > 1))
}

function jaccardSimilarity(answer: string, reference: string) {
  const left = tokens(answer)
  const right = tokens(reference)
  if (!left.size || !right.size) return 0
  let intersection = 0
  left.forEach((token) => {
    if (right.has(token)) intersection += 1
  })
  return (intersection / new Set([...left, ...right]).size) * 100
}

function sequenceSimilarity(answer: string, reference: string) {
  const left = normalize(answer)
  const right = normalize(reference)
  if (!left || !right) return 0
  const previous = new Array(right.length + 1).fill(0).map((_, index) => index)
  for (let i = 1; i <= left.length; i += 1) {
    let diagonal = previous[0]
    previous[0] = i
    for (let j = 1; j <= right.length; j += 1) {
      const next = previous[j]
      previous[j] = left[i - 1] === right[j - 1]
        ? diagonal
        : Math.min(previous[j] + 1, previous[j - 1] + 1, diagonal + 1)
      diagonal = next
    }
  }
  return (1 - previous[right.length] / Math.max(left.length, right.length)) * 100
}

export function calculateEssayScore(
  answer: string,
  reference: string,
  maxPoints: number,
  config: EssayScoringConfig = defaultEssayScoringConfig,
): EssayScoreResult {
  const similarity = Math.round((jaccardSimilarity(answer, reference) * 0.7 + sequenceSimilarity(answer, reference) * 0.3) * 100) / 100
  const bands = [...(config.bands || [])].sort((a, b) => a.similarity - b.similarity)
  const matched = bands.filter((band) => similarity >= band.similarity).at(-1)
  const points = config.enabled && matched ? Math.min(maxPoints, Math.max(0, matched.points)) : 0
  return { similarity, points, needsReview: similarity < (config.review_threshold ?? 60) }
}
