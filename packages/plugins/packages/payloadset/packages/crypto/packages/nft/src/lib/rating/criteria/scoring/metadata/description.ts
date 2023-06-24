import { NftInfo, OpenSeaNftInfo } from '@xyo-network/crypto-wallet-nft-payload-plugin'

import { incrementPossible, incrementTotalAndPossible, ScaledScore } from '../../../score'

export const scoreDescription = (nft: NftInfo | OpenSeaNftInfo): ScaledScore => {
  const score: ScaledScore = [0, 0]
  if (!nft.metadata?.description) return score
  incrementPossible(score)
  if (typeof nft.metadata.description !== 'string') return score
  incrementTotalAndPossible(score)
  return score
}
