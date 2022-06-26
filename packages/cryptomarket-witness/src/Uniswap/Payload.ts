import { XyoPayload, XyoQueryPayload } from '@xyo-network/payload'

import { XyoUniswapCryptoPair } from './CryptoPair'

export interface XyoCryptoMarketUniswapQueryPayload extends XyoQueryPayload {
  pools: string[]
}

export interface XyoCryptoMarketUniswapPayload extends XyoPayload {
  timestamp: number
  pairs: XyoUniswapCryptoPair[]
}
