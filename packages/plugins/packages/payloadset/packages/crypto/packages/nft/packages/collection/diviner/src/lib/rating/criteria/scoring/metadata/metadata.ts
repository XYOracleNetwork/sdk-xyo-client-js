import { NftCollectionInfo } from '@xyo-network/crypto-nft-collection-payload-plugin'
import { WeightedScoringCriteria } from '@xyo-network/crypto-nft-score-model'

import { scoreIndividualAttributes } from './scoreIndividualAttributes'
import { scoreTotalAttributes } from './scoreTotalAttributes'

export const attributeScoringCriteria: { [key: string]: WeightedScoringCriteria<NftCollectionInfo> } = {
  'Metadata Attributes Individual': { score: scoreIndividualAttributes, weight: 2 },
  'Metadata Attributes Total': { score: scoreTotalAttributes, weight: 2 },
}

export const scoreMetadata: { [key: string]: WeightedScoringCriteria<NftCollectionInfo> } = {
  ...attributeScoringCriteria,
}
