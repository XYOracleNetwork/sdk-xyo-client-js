import { XyoWitnessConfig } from '@xyo-network/witness'

import { XyoCryptoAsset } from './lib'
import { XyoCoingeckoCryptoMarketPayloadSchema, XyoCoingeckoCryptoMarketWitnessConfigSchema } from './Schema'

export type XyoCoingeckoCryptoMarketWitnessConfig = XyoWitnessConfig<{
  schema: XyoCoingeckoCryptoMarketWitnessConfigSchema
  targetSchema: XyoCoingeckoCryptoMarketPayloadSchema
  coins: XyoCryptoAsset[]
  currencies: XyoCryptoAsset[]
}>
