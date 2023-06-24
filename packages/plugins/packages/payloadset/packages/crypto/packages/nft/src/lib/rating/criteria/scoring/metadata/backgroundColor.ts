import { NftInfo, OpenSeaNftInfo } from '@xyo-network/crypto-wallet-nft-payload-plugin'

import { incrementPossible, incrementTotalAndPossible, ScaledScore } from '../../../score'

const isHexColor = /^[0-9A-F]{6}$/i

export const scoreNftBackgroundColor = (nft: NftInfo | OpenSeaNftInfo): ScaledScore => {
  return scoreBackgroundColor(nft.metadata?.background_color)
}

export const scoreBackgroundColor = (background_color: unknown): ScaledScore => {
  const score: ScaledScore = [0, 0]
  if (!background_color) return score
  incrementPossible(score)
  if (typeof background_color !== 'string') return score
  incrementTotalAndPossible(score)
  if (!background_color.toUpperCase().match(isHexColor)) return score
  incrementTotalAndPossible(score)
  return score
}
