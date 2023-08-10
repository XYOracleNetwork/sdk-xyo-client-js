import { NftCollectionInfo } from '@xyo-network/crypto-nft-collection-payload-plugin'
import { WeightedScoringCriteria } from '@xyo-network/crypto-nft-score-model'

import { scoreMetadata, scoreTotal } from './scoring'

export const scoringCriteria: { [key: string]: WeightedScoringCriteria<NftCollectionInfo> } = {
  ...scoreMetadata,
  Total: { score: scoreTotal, weight: 2 },
}
