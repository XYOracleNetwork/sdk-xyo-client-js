import { NftCollectionInfo } from '@xyo-network/crypto-nft-collection-payload-plugin'
import { Score } from '@xyo-network/crypto-nft-score-model'

export const scoreMetadata = (collectionInfo: NftCollectionInfo): Score => {
  return [1, 1]
}
