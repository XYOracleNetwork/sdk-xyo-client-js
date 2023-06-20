import { Payload } from '@xyo-network/payload-model'

import { UniswapCryptoPair } from './lib'
import { UniswapCryptoMarketSchema } from './Schema'

export type UniswapCryptoMarketPayload = Payload<{
  pairs: UniswapCryptoPair[]
  schema: UniswapCryptoMarketSchema
  timestamp: number
}>
