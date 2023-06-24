import { NftInfo, OpenSeaNftInfo } from '@xyo-network/crypto-wallet-nft-payload-plugin'

import { incrementPossible, incrementTotalAndPossible, ScaledScore } from '../../../score'

const isHexColor = /^[0-9A-F]{6}$/i

export const scoreBackgroundColor = (nft: NftInfo | OpenSeaNftInfo): ScaledScore => {
  const score: ScaledScore = [0, 0]
  if (!nft.metadata?.background_color) return score
  incrementPossible(score)
  if (typeof nft.metadata.background_color !== 'string') return score
  incrementTotalAndPossible(score)
  if (!nft.metadata.background_color.toUpperCase().match(isHexColor)) return score
  incrementTotalAndPossible(score)
  return score
}
