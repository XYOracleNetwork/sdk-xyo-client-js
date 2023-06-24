import { NftInfo, OpenSeaNftInfo } from '@xyo-network/crypto-wallet-nft-payload-plugin'

import { PASS, ScaledScore } from '../../../score'

export const scoreName = (nft: NftInfo | OpenSeaNftInfo): ScaledScore => {
  return PASS
}
