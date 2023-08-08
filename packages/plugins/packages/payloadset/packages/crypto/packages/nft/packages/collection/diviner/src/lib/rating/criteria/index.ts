import { NftCollectionInfoPayload } from '@xyo-network/crypto-nft-collection-payload-plugin'
import { WeightedScoringCriteria } from '@xyo-network/crypto-nft-score-model'

import { scoreMetadata, scoreTotal } from './scoring'

export const scoringCriteria: { [key: string]: WeightedScoringCriteria<NftCollectionInfoPayload> } = {
  metadata: { score: scoreMetadata, weight: 2 },
  total: { score: scoreTotal, weight: 1 },
}
