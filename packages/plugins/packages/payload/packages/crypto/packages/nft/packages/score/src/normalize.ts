import { Score } from './score'

export const normalize = (score: Score, maxScore: number): Score => {
  const [total, possible] = score
  const normalizedScore = Math.min(Math.round((total / possible) * maxScore), maxScore)
  return [normalizedScore, maxScore]
}
