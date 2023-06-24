import { NftInfo, OpenSeaNftInfo } from '@xyo-network/crypto-wallet-nft-payload-plugin'

import { incrementPossible, incrementTotalAndPossible, ScaledScore } from '../../../score'
import { isSecure, isValidUrl, isWeb3 } from './lib'

export const scoreImage = (nft: NftInfo | OpenSeaNftInfo): ScaledScore => {
  const score: ScaledScore = [0, 0]
  // TODO: Validate if image doesn't exist imageData does
  if (!nft.metadata?.image) return score
  incrementPossible(score)
  if (typeof nft.metadata.image !== 'string') return score
  incrementTotalAndPossible(score)
  if (!isValidUrl(nft.metadata.image)) return score
  incrementTotalAndPossible(score)
  if (!isSecure(nft.metadata.image)) return score
  incrementTotalAndPossible(score)
  if (!isWeb3(nft.metadata.image)) return score
  incrementTotalAndPossible(score)
  // TODO: Validate image format
  return score
}
