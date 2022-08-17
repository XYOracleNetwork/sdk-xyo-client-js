import { XyoQueryPayload } from '@xyo-network/payload'

import { XyoCryptoAsset } from './lib'
import { XyoCoingeckoCryptoMarketQueryPayloadSchema } from './Schema'

export type XyoCoingeckoCryptoMarketQueryPayload = XyoQueryPayload<{
  schema: XyoCoingeckoCryptoMarketQueryPayloadSchema
  coins: XyoCryptoAsset[]
  currencies: XyoCryptoAsset[]
}>
