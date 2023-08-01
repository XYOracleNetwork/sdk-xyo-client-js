import { NftInfo } from '@xyo-network/crypto-nft-payload-plugin'

import { FAIL, PASS, PassFailScoringFunction } from '../../score'
import { isValidPositiveBigNumber } from './lib'

export const scoreSupply: PassFailScoringFunction = (nft: NftInfo) => {
  if (!nft.supply) return FAIL
  if (typeof nft.supply !== 'string') return FAIL
  try {
    // Check for positive BigNumber since data type is uint256
    return isValidPositiveBigNumber(nft.supply) ? PASS : FAIL
  } catch (_error) {
    return FAIL
  }
}
