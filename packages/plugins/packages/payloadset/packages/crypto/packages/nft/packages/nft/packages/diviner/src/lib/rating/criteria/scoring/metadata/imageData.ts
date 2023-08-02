import { NftInfo, OpenSeaNftInfo } from '@xyo-network/crypto-nft-payload-plugin'
import { PASS, ScaledScore } from '@xyo-network/crypto-nft-score-model'
import { parse } from 'svg-parser'

const MaxPossibleImageDataScore = 1

// NOTE: There is probably a deeper check we can do
// here, but this is a good start
const isValidImageData = (image_data: string): boolean => {
  // If it doesn't start with an svg tag, it's not an svg
  if (!image_data.startsWith('<svg')) return false
  try {
    // If it can't be parsed, it's not an svg
    parse(image_data)
    return true
  } catch (error) {
    return false
  }
}

export const scoreNftImageData = (nft: NftInfo | OpenSeaNftInfo): ScaledScore => {
  // If there's no image data
  if (!nft?.metadata?.image_data) {
    // but there is an image, skip this scoring criteria, otherwise fail it completely
    return nft.metadata?.image ? PASS : [0, MaxPossibleImageDataScore]
  } else {
    return scoreImageData(nft.metadata?.image_data)
  }
}

export const scoreImageData = (image_data: unknown): ScaledScore => {
  return !image_data || typeof image_data !== 'string' || !isValidImageData(image_data)
    ? [0, MaxPossibleImageDataScore]
    : [MaxPossibleImageDataScore, MaxPossibleImageDataScore]
}
