import { NftInfo, OpenSeaNftInfo } from '@xyo-network/crypto-nft-payload-plugin'
import { incrementTotal, PASS, ScaledScore } from '@xyo-network/crypto-nft-score-model'

import { isSecure, isValidUrl, isWeb3 } from './lib'

const MaxPossibleImageScore = 3

export const scoreNftImage = (nft: NftInfo | OpenSeaNftInfo): ScaledScore => {
  // If there's no image data
  if (!nft?.metadata?.image) {
    // but there is image data, skip this scoring criteria, otherwise fail it completely
    return nft.metadata?.image_data ? PASS : [0, MaxPossibleImageScore]
  } else {
    return scoreImage(nft.metadata?.image)
  }
}

export const scoreImage = (image: unknown): ScaledScore => {
  const score: ScaledScore = [0, MaxPossibleImageScore]
  if (!image || typeof image !== 'string' || !isValidUrl(image)) return score
  incrementTotal(score)
  if (!isSecure(image)) return score
  incrementTotal(score)
  if (!isWeb3(image)) return score
  incrementTotal(score)
  return score
}
