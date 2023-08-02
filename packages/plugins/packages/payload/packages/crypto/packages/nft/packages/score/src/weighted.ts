import { EmptyPayload } from '@xyo-network/payload-model'

import { ScoringFunction } from './scoringFunction'

export interface WeightedScoringCriteria<T extends EmptyPayload = EmptyPayload> {
  score: ScoringFunction<T>
  weight: number
}
