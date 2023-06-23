import { WeightedScoringCriteria } from '../score'
import { scoreFormat } from './scoring'

export const scoringCriteria: Record<string, WeightedScoringCriteria> = {
  format: { score: scoreFormat, weight: 1 },
}
