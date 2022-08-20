import { XyoWitnessConfig } from '@xyo-network/witness'

import { XyoCryptoAsset } from './lib'
import { XyoCoingeckoCryptoMarketPayloadSchema, XyoCoingeckoCryptoMarketWitnessConfigSchema } from './Schema'

export type XyoCoingeckoCryptoMarketWitnessConfig = XyoWitnessConfig<{
  schema: XyoCoingeckoCryptoMarketWitnessConfigSchema
  coins: XyoCryptoAsset[]
  currencies: XyoCryptoAsset[]
  targetSchema: XyoCoingeckoCryptoMarketPayloadSchema
}>
