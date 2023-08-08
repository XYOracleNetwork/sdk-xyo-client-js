import { scoreMetadata, scoreTotal } from './scoring'

export const scoringCriteria = {
  metadata: { score: scoreMetadata, weight: 2 },
  total: { score: scoreTotal, weight: 1 },
}
