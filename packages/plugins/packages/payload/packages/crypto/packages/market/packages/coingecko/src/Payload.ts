import { Payload } from '@xyo-network/payload-model'

import { CryptoAssetPrices } from './lib'
import { CoingeckoCryptoMarketSchema } from './Schema'

export type CoingeckoCryptoMarketPayload = Payload<{
  assets: CryptoAssetPrices
  schema: CoingeckoCryptoMarketSchema
  timestamp: number
}>
