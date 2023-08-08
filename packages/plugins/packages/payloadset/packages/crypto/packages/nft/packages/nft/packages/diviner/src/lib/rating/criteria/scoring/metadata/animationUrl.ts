import { NftInfoFields, OpenSeaNftInfoFields } from '@xyo-network/crypto-nft-payload-plugin'
import { incrementPossible, incrementTotal, incrementTotalAndPossible, PASS, ScaledScore } from '@xyo-network/crypto-nft-score-model'

import { isSecure, isValidUrl, isWeb3 } from './lib'

export const scoreNftAnimationUrl = (nft: NftInfoFields | OpenSeaNftInfoFields): ScaledScore => {
  return scoreAnimationUrl(nft.metadata?.animation_url)
}

export const scoreAnimationUrl = (animation_url: unknown): ScaledScore => {
  const score: ScaledScore = [0, 0]
  if (animation_url === undefined || animation_url === null) return PASS
  incrementPossible(score)
  if (typeof animation_url !== 'string') return score
  incrementTotalAndPossible(score)
  if (!isValidUrl(animation_url)) return score
  incrementTotalAndPossible(score)
  if (!isSecure(animation_url)) return score
  incrementTotalAndPossible(score)
  if (!isWeb3(animation_url)) return score
  return incrementTotal(score)
}
