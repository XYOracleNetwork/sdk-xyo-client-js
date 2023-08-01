import { NftInfo, OpenSeaNftInfo } from '@xyo-network/crypto-nft-payload-plugin'

import { incrementTotal, ScaledScore } from '../../../score'

export const scoreNftDescription = (nft: NftInfo | OpenSeaNftInfo): ScaledScore => {
  return scoreDescription(nft.metadata?.description)
}

export const scoreDescription = (description: unknown): ScaledScore => {
  const score: ScaledScore = [0, 1]
  if (!description || typeof description !== 'string') return score
  return incrementTotal(score)
}
