import { NftInfo, OpenSeaNftInfo } from '@xyo-network/crypto-wallet-nft-payload-plugin'

import { incrementPossible, incrementTotalAndPossible, PASS, ScaledScore } from '../../../score'
import { isSecure, isValidUrl } from './lib'

export const scoreExternalUrl = (nft: NftInfo | OpenSeaNftInfo): ScaledScore => {
  const score: ScaledScore = [0, 0]
  if (!nft.metadata?.external_url) return score
  incrementPossible(score)
  if (typeof nft.metadata.external_url !== 'string') return score
  incrementTotalAndPossible(score)
  if (!isValidUrl(nft.metadata.external_url)) return score
  incrementTotalAndPossible(score)
  if (!isSecure(nft.metadata.external_url)) return score
  incrementTotalAndPossible(score)
  return score
}
