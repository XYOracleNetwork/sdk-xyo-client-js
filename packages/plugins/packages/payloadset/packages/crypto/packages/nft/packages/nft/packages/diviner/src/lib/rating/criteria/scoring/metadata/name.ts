import { NftInfo, OpenSeaNftInfo } from '@xyo-network/crypto-nft-payload-plugin'

import { incrementTotal, ScaledScore } from '../../../score'

export const scoreNftName = (nft: NftInfo | OpenSeaNftInfo): ScaledScore => {
  return scoreName(nft.metadata?.name)
}
export const scoreName = (name: unknown): ScaledScore => {
  const score: ScaledScore = [0, 1]
  if (!name || typeof name !== 'string') return score
  return incrementTotal(score)
}
