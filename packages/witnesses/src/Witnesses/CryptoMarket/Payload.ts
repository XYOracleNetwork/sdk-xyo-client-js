import { XyoPayload } from '@xyo-network/core'

export interface XyoCryptoMarketAsset {
  usd?: number
  eur?: number
  btc?: number
  eth?: number
}

export interface XyoCryptoMarketPayload extends XyoPayload {
  timestamp: number
  assets?: XyoCryptoMarketAsset[]
}
