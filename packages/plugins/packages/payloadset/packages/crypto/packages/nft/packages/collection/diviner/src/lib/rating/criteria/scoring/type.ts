import { NftInfo } from '@xyo-network/crypto-nft-payload-plugin'
import { FAIL, PASS, PassFailScoringFunction } from '@xyo-network/crypto-nft-score-model'

export const scoreType: PassFailScoringFunction<NftInfo> = (nft: NftInfo) => {
  if (!nft.type) return FAIL
  if (typeof nft.type !== 'string') return FAIL
  const type = nft.type.toUpperCase()
  if (type !== 'ERC721' && type !== 'ERC1155') return FAIL
  return PASS
}
