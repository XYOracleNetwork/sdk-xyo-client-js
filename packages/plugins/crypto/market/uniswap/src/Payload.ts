import { XyoPayload } from '@xyo-network/payload'

import { XyoUniswapCryptoPair } from './lib'
import { XyoCryptoMarketUniswapPayloadSchema } from './Schema'

export type XyoCryptoMarketUniswapPayload = XyoPayload<{
  schema: XyoCryptoMarketUniswapPayloadSchema
  timestamp: number
  pairs: XyoUniswapCryptoPair[]
}>
