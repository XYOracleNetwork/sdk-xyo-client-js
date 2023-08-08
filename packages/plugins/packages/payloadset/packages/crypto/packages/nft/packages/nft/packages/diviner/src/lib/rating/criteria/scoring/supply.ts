import { NftInfoFields } from '@xyo-network/crypto-nft-payload-plugin'
import { FAIL, PASS, PassFailScoringFunction } from '@xyo-network/crypto-nft-score-model'

import { isValidPositiveBigNumber } from './lib'

export const scoreSupply: PassFailScoringFunction<NftInfoFields> = (nft: NftInfoFields) => {
  if (!nft.supply) return FAIL
  if (typeof nft.supply !== 'string') return FAIL
  try {
    // Check for positive BigNumber since data type is uint256
    return isValidPositiveBigNumber(nft.supply) ? PASS : FAIL
  } catch (_error) {
    return FAIL
  }
}
