import { NftInfo, OpenSeaNftInfo } from '@xyo-network/crypto-wallet-nft-payload-plugin'

import { incrementTotal, PASS, ScaledScore } from '../../../score'

const MaxPossibleImageDataScore = 1

const isValidImageData = (image_data: string): boolean => {
  return false
}

export const scoreNftImageData = (nft: NftInfo | OpenSeaNftInfo): ScaledScore => {
  if (!nft?.metadata?.image_data) {
    return nft.metadata?.image ? PASS : [0, MaxPossibleImageDataScore]
  } else {
    return scoreImageData(nft.metadata?.image_data)
  }
}

export const scoreImageData = (image_data: unknown): ScaledScore => {
  const score: ScaledScore = [0, MaxPossibleImageDataScore]
  if (!image_data || typeof image_data !== 'string' || !isValidImageData(image_data)) return score
  return incrementTotal(score)
}
