import { XyoPayload, XyoQueryPayload } from '@xyo-network/core'

import { XyoCryptoAsset } from './XyoCryptoAsset'
import { XyoCryptoAssets } from './XyoCryptoAssets'

export interface XyoCryptoMarketCoinGeckoQueryPayload extends XyoQueryPayload {
  coins: XyoCryptoAsset[]
  currencies: XyoCryptoAsset[]
}

export interface XyoCryptoMarketCoinGeckoPayload extends XyoPayload {
  timestamp: number
  assets: XyoCryptoAssets
}
