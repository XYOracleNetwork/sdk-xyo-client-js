import { XyoPayload } from '../../core'

export interface XyoCryptoMarketAsset {
  usd: number
}

export interface XyoCryptoMarketPayload extends XyoPayload {
  timestamp: number
  assets: XyoCryptoMarketAsset[]
}
