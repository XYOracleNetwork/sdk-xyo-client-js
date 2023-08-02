import { isAddress } from '@ethersproject/address'
import { NftInfo } from '@xyo-network/crypto-nft-payload-plugin'
import { FAIL, PASS, PassFailScoringFunction } from '@xyo-network/crypto-nft-score-model'

export const scoreContractAddress: PassFailScoringFunction = (nft: NftInfo) => {
  if (!nft.contract) return FAIL
  if (typeof nft.contract !== 'string') return FAIL
  if (!isAddress(nft.contract)) return FAIL
  return PASS
}
