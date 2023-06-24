import { NftInfo, OpenSeaNftInfo } from '@xyo-network/crypto-wallet-nft-payload-plugin'

import { incrementPossible, incrementTotalAndPossible, ScaledScore } from '../../../score'
import { isSecure, isValidUrl, isWeb3 } from './lib'

export const scoreNftAnimationUrl = (nft: NftInfo | OpenSeaNftInfo): ScaledScore => {
  return scoreAnimationUrl(nft.metadata?.animation_url)
}

export const scoreAnimationUrl = (animation_url: unknown): ScaledScore => {
  const score: ScaledScore = [0, 0]
  if (!animation_url) return score
  incrementPossible(score)
  if (typeof animation_url !== 'string') return score
  incrementTotalAndPossible(score)
  if (!isValidUrl(animation_url)) return score
  incrementTotalAndPossible(score)
  if (!isSecure(animation_url)) return score
  incrementTotalAndPossible(score)
  if (!isWeb3(animation_url)) return score
  incrementTotalAndPossible(score)
  return score
}
