import { NftInfo } from '@xyo-network/crypto-wallet-nft-payload-plugin'

import { FAIL, PASS, PassFailScoringFunction } from '../../score'

export const scoreType: PassFailScoringFunction = (nft: NftInfo) => {
  if (nft instanceof Array) return FAIL
  if (nft.constructor === Object) return PASS
  return FAIL
}
