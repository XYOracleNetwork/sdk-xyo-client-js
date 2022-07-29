import { XyoPayload, XyoQueryPayload } from '@xyo-network/payload'

import { XyoCryptoAsset } from './XyoCryptoAsset'
import { XyoCryptoAssetPrices } from './XyoCryptoAssets'

export interface XyoCryptoMarketCoinGeckoQueryPayload extends XyoQueryPayload {
  coins: XyoCryptoAsset[]
  currencies: XyoCryptoAsset[]
}

export interface XyoCryptoMarketCoinGeckoPayload extends XyoPayload {
  schema: 'network.xyo.crypto.market.coingecko'
  timestamp: number
  assets: XyoCryptoAssetPrices
}
