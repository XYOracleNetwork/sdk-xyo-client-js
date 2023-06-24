import { NftInfo, OpenSeaNftInfo } from '@xyo-network/crypto-wallet-nft-payload-plugin'

import { incrementPossible, incrementTotalAndPossible, ScaledScore } from '../../../score'
import { isSecure, isValidUrl, isWeb3 } from './lib'

export const scoreAnimationUrl = (nft: NftInfo | OpenSeaNftInfo): ScaledScore => {
  const score: ScaledScore = [0, 0]
  if (!nft.metadata?.animation_url) return score
  incrementPossible(score)
  if (typeof nft.metadata.animation_url !== 'string') return score
  incrementTotalAndPossible(score)
  if (!isValidUrl(nft.metadata.animation_url)) return score
  incrementTotalAndPossible(score)
  if (!isSecure(nft.metadata.animation_url)) return score
  incrementTotalAndPossible(score)
  if (!isWeb3(nft.metadata.animation_url)) return score
  incrementTotalAndPossible(score)
  return score
}
