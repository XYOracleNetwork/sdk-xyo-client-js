import { NftInfoFields, OpenSeaNftInfoFields } from '@xyo-network/crypto-nft-payload-plugin'
import { incrementTotal, PASS, ScaledScore } from '@xyo-network/crypto-nft-score-model'

import { isSecure, isValidUrl } from './lib'

export const scoreNftYoutubeUrl = (nft: NftInfoFields | OpenSeaNftInfoFields): ScaledScore => {
  return scoreYoutubeUrl(nft?.metadata?.youtube_url)
}
export const scoreYoutubeUrl = (youtube_url: unknown): ScaledScore => {
  if (youtube_url === undefined || youtube_url === null) return PASS
  const score: ScaledScore = [0, 2]
  if (typeof youtube_url !== 'string' || !isValidUrl(youtube_url)) return score
  incrementTotal(score)
  if (!isSecure(youtube_url)) return score
  return incrementTotal(score)
}
