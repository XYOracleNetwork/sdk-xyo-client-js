import { XyoWitnessConfig } from '@xyo-network/witness'

import { XyoUniswapCryptoMarketWitnessConfigSchema } from './Schema'

export type XyoUniswapCryptoMarketWitnessConfig = XyoWitnessConfig<{
  pools: string[]
  schema: XyoUniswapCryptoMarketWitnessConfigSchema
}>
