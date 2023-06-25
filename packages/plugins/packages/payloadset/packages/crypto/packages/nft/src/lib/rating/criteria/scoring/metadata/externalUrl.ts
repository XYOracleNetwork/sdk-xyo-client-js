import { NftInfo, OpenSeaNftInfo } from '@xyo-network/crypto-wallet-nft-payload-plugin'

import { incrementTotal, ScaledScore } from '../../../score'
import { isSecure, isValidUrl } from './lib'

export const scoreNftExternalUrl = (nft: NftInfo | OpenSeaNftInfo): ScaledScore => {
  return scoreExternalUrl(nft?.metadata?.external_url)
}
export const scoreExternalUrl = (external_url: unknown): ScaledScore => {
  const score: ScaledScore = [0, 2]
  if (external_url === undefined || external_url === null || typeof external_url !== 'string' || !isValidUrl(external_url)) return score
  incrementTotal(score)
  if (!isSecure(external_url)) return score
  return incrementTotal(score)
}
