import { Payload } from '@xyo-network/payload-model'

import { XyoUniswapCryptoPair } from './lib'
import { XyoUniswapCryptoMarketSchema } from './Schema'

export type XyoUniswapCryptoMarketPayload = Payload<{
  pairs: XyoUniswapCryptoPair[]
  schema: XyoUniswapCryptoMarketSchema
  timestamp: number
}>
