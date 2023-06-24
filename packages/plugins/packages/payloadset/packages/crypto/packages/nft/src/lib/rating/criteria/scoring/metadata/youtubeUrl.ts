import { NftInfo, OpenSeaNftInfo } from '@xyo-network/crypto-wallet-nft-payload-plugin'
import { URL } from 'url'

import { incrementPossible, incrementTotal, ScaledScore, SKIP } from '../../../score'
import { toUrl } from './lib'

const evaluateProtocol = (url: URL, score: ScaledScore): ScaledScore => {
  incrementPossible(score)
  if (url.protocol === 'https:') score[0]++
  return score
}

export const scoreYoutubeUrl = (nft: NftInfo | OpenSeaNftInfo): ScaledScore => {
  if (!nft.metadata?.youtube_url) return SKIP
  const score: ScaledScore = [0, 0]
  incrementPossible(score)
  const url = toUrl((nft as OpenSeaNftInfo).metadata.youtube_url)
  if (!url) return score
  incrementTotal(score)
  evaluateProtocol(url, score)
  return score
}
