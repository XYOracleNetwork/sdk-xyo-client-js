import { XyoPayload } from '@xyo-network/core'

import { XyoCryptoAssets } from './XyoCryptoAssets'

export interface XyoCryptoMarketPayload extends XyoPayload {
  timestamp: number
  assets: XyoCryptoAssets
}
