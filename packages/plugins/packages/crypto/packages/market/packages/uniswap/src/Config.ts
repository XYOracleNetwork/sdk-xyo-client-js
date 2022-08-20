import { Provider } from '@ethersproject/providers'
import { XyoWitnessConfig } from '@xyo-network/witness'

import { XyoUniswapCryptoMarketPayloadSchema, XyoUniswapCryptoMarketWitnessConfigSchema } from './Schema'

export type XyoUniswapCryptoMarketWitnessConfig = XyoWitnessConfig<{
  schema: XyoUniswapCryptoMarketWitnessConfigSchema
  provider: Provider
  pools: string[]
  targetSchema: XyoUniswapCryptoMarketPayloadSchema
}>
