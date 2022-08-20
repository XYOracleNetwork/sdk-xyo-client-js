import { XyoWitnessConfig } from '@xyo-network/witness'

import { XyoCryptoAsset } from './lib'
import { XyoCoingeckoCryptoMarketPayloadSchema, XyoCoingeckoCryptoMarketWitnessConfigSchema } from './Schema'

export type XyoCoingeckoCryptoMarketWitnessConfig = XyoWitnessConfig<
  XyoCoingeckoCryptoMarketPayloadSchema,
  {
    schema: XyoCoingeckoCryptoMarketWitnessConfigSchema
    coins: XyoCryptoAsset[]
    currencies: XyoCryptoAsset[]
  }
>
