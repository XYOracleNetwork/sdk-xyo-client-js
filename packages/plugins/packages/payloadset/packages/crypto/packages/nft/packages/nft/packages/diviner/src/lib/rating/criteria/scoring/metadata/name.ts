import { NftInfoFields, OpenSeaNftInfoFields } from '@xyo-network/crypto-nft-payload-plugin'
import { incrementTotal, ScaledScore } from '@xyo-network/crypto-nft-score-model'

export const scoreNftName = (nft: NftInfoFields | OpenSeaNftInfoFields): ScaledScore => {
  return scoreName(nft.metadata?.name)
}
export const scoreName = (name: unknown): ScaledScore => {
  const score: ScaledScore = [0, 1]
  if (!name || typeof name !== 'string') return score
  return incrementTotal(score)
}
