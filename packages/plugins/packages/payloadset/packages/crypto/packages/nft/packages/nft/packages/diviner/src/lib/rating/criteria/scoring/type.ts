import { NftInfoFields } from '@xyo-network/crypto-nft-payload-plugin'
import { FAIL, PASS, PassFailScoringFunction } from '@xyo-network/crypto-nft-score-model'

export const scoreType: PassFailScoringFunction<NftInfoFields> = (nft: NftInfoFields) => {
  if (!nft.tokenType) return FAIL
  if (typeof nft.tokenType !== 'string') return FAIL
  const type = nft.tokenType.toUpperCase()
  if (type !== 'ERC721' && type !== 'ERC1155') return FAIL
  return PASS
}
