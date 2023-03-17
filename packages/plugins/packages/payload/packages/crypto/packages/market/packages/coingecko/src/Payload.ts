import { Payload } from '@xyo-network/payload-model'

import { XyoCryptoAssetPrices } from './lib'
import { XyoCoingeckoCryptoMarketSchema } from './Schema'

export type XyoCoingeckoCryptoMarketPayload = Payload<{
  assets: XyoCryptoAssetPrices
  schema: XyoCoingeckoCryptoMarketSchema
  timestamp: number
}>
