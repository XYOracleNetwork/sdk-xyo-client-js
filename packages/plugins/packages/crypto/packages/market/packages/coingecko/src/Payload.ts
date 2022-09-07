import { XyoPayload } from '@xyo-network/payload'

import { XyoCryptoAssetPrices } from './lib'
import { XyoCoingeckoCryptoMarketSchema } from './Schema'

export type XyoCoingeckoCryptoMarketPayload = XyoPayload<{
  schema: XyoCoingeckoCryptoMarketSchema
  timestamp: number
  assets: XyoCryptoAssetPrices
}>
