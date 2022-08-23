import { XyoWitnessConfig } from '@xyo-network/witness'

import { XyoCryptoAsset } from './lib'
import { XyoCoingeckoCryptoMarketPayload } from './Payload'
import { XyoCoingeckoCryptoMarketPayloadSchema, XyoCoingeckoCryptoMarketWitnessConfigSchema } from './Schema'

export type XyoCoingeckoCryptoMarketWitnessConfig = XyoWitnessConfig<
  XyoCoingeckoCryptoMarketPayload,
  {
    schema: XyoCoingeckoCryptoMarketWitnessConfigSchema
    targetSchema: XyoCoingeckoCryptoMarketPayloadSchema
    coins: XyoCryptoAsset[]
    currencies: XyoCryptoAsset[]
  }
>
