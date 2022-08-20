import { Provider } from '@ethersproject/providers'
import { XyoWitnessConfig } from '@xyo-network/witness'

import { XyoUniswapCryptoMarketPayloadSchema, XyoUniswapCryptoMarketWitnessConfigSchema } from './Schema'

export type XyoUniswapCryptoMarketWitnessConfig = XyoWitnessConfig<
  XyoUniswapCryptoMarketPayloadSchema,
  {
    schema: XyoUniswapCryptoMarketWitnessConfigSchema
    provider: Provider
    pools: string[]
  }
>
