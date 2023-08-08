import { isAddress } from '@ethersproject/address'
import { NftInfoFields } from '@xyo-network/crypto-nft-payload-plugin'
import { FAIL, PASS, PassFailScoringFunction } from '@xyo-network/crypto-nft-score-model'

export const scoreContractAddress: PassFailScoringFunction<NftInfoFields> = (nft: NftInfoFields) => {
  if (!nft.contract) return FAIL
  if (typeof nft.contract !== 'string') return FAIL
  if (!isAddress(nft.contract)) return FAIL
  return PASS
}
