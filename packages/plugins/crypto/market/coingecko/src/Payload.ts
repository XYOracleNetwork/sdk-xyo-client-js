import { XyoPayload } from '@xyo-network/payload'

import { XyoCryptoAssetPrices } from './lib'
import { XyoCoingeckoCryptoMarketPayloadSchema } from './Schema'

export type XyoCoingeckoCryptoMarketPayload = XyoPayload<{
  schema: XyoCoingeckoCryptoMarketPayloadSchema
  timestamp: number
  assets: XyoCryptoAssetPrices
}>
