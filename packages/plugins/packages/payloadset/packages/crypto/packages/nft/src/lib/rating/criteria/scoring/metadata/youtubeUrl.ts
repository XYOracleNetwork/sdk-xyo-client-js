import { NftInfo, OpenSeaNftInfo } from '@xyo-network/crypto-wallet-nft-payload-plugin'

import { incrementTotal, PASS, ScaledScore } from '../../../score'
import { isSecure, isValidUrl } from './lib'

export const scoreNftYoutubeUrl = (nft: NftInfo | OpenSeaNftInfo): ScaledScore => {
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