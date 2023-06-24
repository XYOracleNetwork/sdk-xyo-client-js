import { NftInfo, OpenSeaNftInfo } from '@xyo-network/crypto-wallet-nft-payload-plugin'

import { PASS, ScaledScore } from '../../../score'

export const scoreImage = (nft: NftInfo | OpenSeaNftInfo): ScaledScore => {
  return PASS
}
