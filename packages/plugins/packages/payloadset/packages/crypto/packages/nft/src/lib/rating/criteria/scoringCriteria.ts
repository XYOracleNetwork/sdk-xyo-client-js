import { WeightedScoringCriteria } from '../score'
import { scoreContractAddress, scoreSupply, scoreTokenId, scoreType } from './scoring'

const metadataScoringCriteria: Record<string, WeightedScoringCriteria> = {}

export const scoringCriteria: Record<string, WeightedScoringCriteria> = {
  'Contract.Address': { score: scoreContractAddress, weight: 1 },
  Supply: { score: scoreSupply, weight: 1 },
  'Token Id': { score: scoreTokenId, weight: 1 },
  Type: { score: scoreType, weight: 1 },
  ...metadataScoringCriteria,
}
