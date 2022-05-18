import { XyoPayload, XyoQueryPayload } from '@xyo-network/core'

import { XyoCryptoAssets } from './XyoCryptoAssets'

export interface XyoCryptoMarketQueryPayload extends XyoQueryPayload {
  assets: string[]
}

export interface XyoCryptoMarketPayload extends XyoPayload {
  timestamp: number
  assets: XyoCryptoAssets
}
