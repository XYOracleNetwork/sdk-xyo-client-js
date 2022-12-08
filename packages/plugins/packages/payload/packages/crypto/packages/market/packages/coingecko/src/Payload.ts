import { XyoPayload } from '@xyo-network/payload'

import { XyoCryptoAssetPrices } from './lib'
import { XyoCoingeckoCryptoMarketSchema } from './Schema'

export type XyoCoingeckoCryptoMarketPayload = XyoPayload<{
  assets: XyoCryptoAssetPrices
  schema: XyoCoingeckoCryptoMarketSchema
  timestamp: number
}>
