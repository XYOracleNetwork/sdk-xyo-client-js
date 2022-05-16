import { XyoPayload } from '@xyo-network/core'

export interface XyoCryptoMarketAsset {
  coin: string
  currency: string
  value: number
}

export interface XyoCryptoMarketPayload extends XyoPayload {
  timestamp: number
  assets?: XyoCryptoMarketAsset[]
}
