import { XyoPayload, XyoQueryPayload } from '@xyo-network/payload'

import { XyoUniswapCryptoPair } from './CryptoPair'

export type XyoCryptoMarketUniswapQueryPayload = XyoQueryPayload<{
  schema: 'network.xyo.crypto.market.uniswap.query'
  pools: string[]
}>

export interface XyoCryptoMarketUniswapPayload extends XyoPayload {
  schema: 'network.xyo.crypto.market.uniswap'
  timestamp: number
  pairs: XyoUniswapCryptoPair[]
}
