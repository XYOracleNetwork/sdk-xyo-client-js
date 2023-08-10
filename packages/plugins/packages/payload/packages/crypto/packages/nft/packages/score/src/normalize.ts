import { Score, SKIP } from './score'

export const normalize = (score: Score, maxScore: number): Score => {
  const [total, possible] = score
  if (possible === 0) return SKIP
  const normalizedScore = Math.min(Math.round((total / possible) * maxScore), maxScore)
  return [normalizedScore, maxScore]
}
