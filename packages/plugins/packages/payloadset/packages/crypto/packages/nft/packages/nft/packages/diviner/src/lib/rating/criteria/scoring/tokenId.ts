import { NftInfoFields } from '@xyo-network/crypto-nft-payload-plugin'
import { FAIL, PASS, PassFailScoringFunction } from '@xyo-network/crypto-nft-score-model'

import { isValidPositiveBigNumber } from './lib'

/**
 * Callers SHALL NOT assume that ID numbers have any specific pattern to them, and
 * MUST treat the ID as a "black box"
 * @param nft
 * @returns
 */
export const scoreTokenId: PassFailScoringFunction<NftInfoFields> = (nft: NftInfoFields) => {
  if (!nft.tokenId) return FAIL
  if (typeof nft.tokenId !== 'string') return FAIL
  try {
    // Check for positive BigNumber since data type is uint256
    return isValidPositiveBigNumber(nft.tokenId) ? PASS : FAIL
  } catch (_error) {
    return FAIL
  }
}
