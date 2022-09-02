import { XyoWitnessConfig } from '@xyo-network/witness'

import { XyoCryptoAsset } from './lib'
import { XyoCoingeckoCryptoMarketPayload } from './Payload'
import { XyoCoingeckoCryptoMarketWitnessConfigSchema } from './Schema'

export type XyoCoingeckoCryptoMarketWitnessConfig = XyoWitnessConfig<
  XyoCoingeckoCryptoMarketPayload,
  {
    schema: XyoCoingeckoCryptoMarketWitnessConfigSchema
    coins: XyoCryptoAsset[]
    currencies: XyoCryptoAsset[]
  }
>
