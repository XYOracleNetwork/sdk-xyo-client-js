import { XyoWitnessConfig } from '@xyo-network/witness'

import { XyoCryptoAsset } from './lib'
import { XyoCoingeckoCryptoMarketWitnessConfigSchema } from './Schema'

export type XyoCoingeckoCryptoMarketWitnessConfig = XyoWitnessConfig<{
  coins: XyoCryptoAsset[]
  currencies: XyoCryptoAsset[]
  schema: XyoCoingeckoCryptoMarketWitnessConfigSchema
}>
