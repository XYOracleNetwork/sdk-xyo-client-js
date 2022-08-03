import { XyoPayload } from '@xyo-network/payload'

import { XyoUniswapCryptoPair } from './lib'
import { XyoUniswapCryptoMarketPayloadSchema } from './Schema'

export type XyoUniswapCryptoMarketPayload = XyoPayload<{
  schema: XyoUniswapCryptoMarketPayloadSchema
  timestamp: number
  pairs: XyoUniswapCryptoPair[]
}>
