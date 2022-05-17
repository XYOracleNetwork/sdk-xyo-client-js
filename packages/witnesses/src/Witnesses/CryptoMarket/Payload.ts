import { XyoPayload } from '@xyo-network/core'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PartialRecord<K extends keyof any, T> = {
  [P in K]?: T
}

export type AssetSymbol = 'btc' | 'eth' | 'xyo' | 'usd' | 'eur'

export type XyoCryptoMarketAssets = PartialRecord<AssetSymbol, PartialRecord<AssetSymbol, number> | undefined>

export interface XyoCryptoMarketPayload extends XyoPayload {
  timestamp: number
  assets: XyoCryptoMarketAssets
}
