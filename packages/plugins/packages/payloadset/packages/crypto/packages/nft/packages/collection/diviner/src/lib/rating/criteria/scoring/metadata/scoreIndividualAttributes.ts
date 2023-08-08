import { NftCollectionAttributeMetrics } from '@xyo-network/crypto-nft-collection-payload-plugin'
import { Score } from '@xyo-network/crypto-nft-score-model'

export const scoreIndividualAttributes = (_attribute: NftCollectionAttributeMetrics): Score => {
  return [0, 1]
}
