import { XyoWitnessConfig } from '@xyo-network/witness'

import { XyoCryptoAsset } from './lib'
import { XyoCoingeckoCryptoMarketPayload } from './Payload'
import { XyoCoingeckoCryptoMarketWitnessConfigSchema } from './Schema'

export type XyoCoingeckoCryptoMarketWitnessConfig = XyoWitnessConfig<
  XyoCoingeckoCryptoMarketPayload,
  {
    coins: XyoCryptoAsset[]
    currencies: XyoCryptoAsset[]
    schema: XyoCoingeckoCryptoMarketWitnessConfigSchema
  }
>
