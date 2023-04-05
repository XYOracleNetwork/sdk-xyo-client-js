import { XyoCryptoAsset } from '@xyo-network/coingecko-crypto-market-payload-plugin'
import { WitnessConfig } from '@xyo-network/witness'

import { XyoCoingeckoCryptoMarketWitnessConfigSchema } from './Schema'

export type XyoCoingeckoCryptoMarketWitnessConfig = WitnessConfig<{
  coins?: XyoCryptoAsset[]
  currencies?: XyoCryptoAsset[]
  schema: XyoCoingeckoCryptoMarketWitnessConfigSchema
}>
