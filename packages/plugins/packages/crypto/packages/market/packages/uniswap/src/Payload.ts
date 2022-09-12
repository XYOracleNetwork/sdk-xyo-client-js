import { XyoPayload } from '@xyo-network/payload'

import { XyoUniswapCryptoPair } from './lib'
import { XyoUniswapCryptoMarketSchema } from './Schema'

export type XyoUniswapCryptoMarketPayload = XyoPayload<{
  schema: XyoUniswapCryptoMarketSchema
  timestamp: number
  pairs: XyoUniswapCryptoPair[]
}>
