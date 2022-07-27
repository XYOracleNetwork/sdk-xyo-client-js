import { XyoPayload, XyoQueryPayload } from '@xyo-network/payload'

import { XyoUniswapCryptoPair } from './CryptoPair'

export interface XyoCryptoMarketUniswapQueryPayload extends XyoQueryPayload<XyoCryptoMarketUniswapPayload> {
  pools: string[]
}

export interface XyoCryptoMarketUniswapPayload extends XyoPayload {
  schema: 'network.xyo.crypto.market.uniswap'
  timestamp: number
  pairs: XyoUniswapCryptoPair[]
}
