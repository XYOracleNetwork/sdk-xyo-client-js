import { NftInfo, OpenSeaNftInfo } from '@xyo-network/crypto-wallet-nft-payload-plugin'

import { ScaledScore, SKIP } from '../../../score'
import { ParsedUrl, toUrl } from './lib'

const evaluateProtocol = (url: ParsedUrl, score: ScaledScore): ScaledScore => {
  score[1]++
  if (url.protocol === 'https:') score[0]++
  return score
}

export const scoreMetadataYoutubeUrl = (nft: NftInfo | OpenSeaNftInfo): ScaledScore => {
  if (!nft.metadata?.youtube_url) return SKIP
  const score: ScaledScore = [0, 0]
  score[1]++
  const url = toUrl((nft as OpenSeaNftInfo).metadata.youtube_url)
  if (!url) return score
  score[0]++
  evaluateProtocol(url, score)
  return score
}
