import { XyoCryptoAsset } from '@xyo-network/coingecko-crypto-market-payload-plugin'
import { XyoWitnessConfig } from '@xyo-network/witness'

import { XyoCoingeckoCryptoMarketWitnessConfigSchema } from './Schema'

export type XyoCoingeckoCryptoMarketWitnessConfig = XyoWitnessConfig<{
  coins: XyoCryptoAsset[]
  currencies: XyoCryptoAsset[]
  schema: XyoCoingeckoCryptoMarketWitnessConfigSchema
}>
