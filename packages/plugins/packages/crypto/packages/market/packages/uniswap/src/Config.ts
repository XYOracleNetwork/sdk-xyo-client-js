import { Provider } from '@ethersproject/providers'
import { XyoWitnessConfig } from '@xyo-network/witness'

import { XyoUniswapCryptoMarketPayloadSchema, XyoUniswapCryptoMarketWitnessConfigSchema } from './Schema'

export type XyoUniswapCryptoMarketWitnessConfig = XyoWitnessConfig<{
  schema: XyoUniswapCryptoMarketWitnessConfigSchema
  targetSchema: XyoUniswapCryptoMarketPayloadSchema
  provider: Provider
  pools: string[]
}>
