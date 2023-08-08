import { NftCollectionInfoPayload } from '@xyo-network/crypto-nft-collection-payload-plugin'
import { WeightedScoringCriteria } from '@xyo-network/crypto-nft-score-model'

import { scoreMetadata, scoreTotal } from './scoring'

export const scoringCriteria: { [key: string]: WeightedScoringCriteria<NftCollectionInfoPayload> } = {
  ...scoreMetadata,
  total: { score: scoreTotal, weight: 1 },
}
