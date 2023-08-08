import { NftInfoFields, OpenSeaNftInfoFields } from '@xyo-network/crypto-nft-payload-plugin'
import { incrementTotal, ScaledScore } from '@xyo-network/crypto-nft-score-model'

import { isSecure, isValidUrl } from './lib'

export const scoreNftExternalUrl = (nft: NftInfoFields | OpenSeaNftInfoFields): ScaledScore => {
  return scoreExternalUrl(nft?.metadata?.external_url)
}
export const scoreExternalUrl = (external_url: unknown): ScaledScore => {
  const score: ScaledScore = [0, 2]
  if (external_url === undefined || external_url === null || typeof external_url !== 'string' || !isValidUrl(external_url)) return score
  incrementTotal(score)
  if (!isSecure(external_url)) return score
  return incrementTotal(score)
}
