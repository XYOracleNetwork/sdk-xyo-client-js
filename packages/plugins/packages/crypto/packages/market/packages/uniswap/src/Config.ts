import { XyoWitnessConfig } from '@xyo-network/witness'

import { XyoUniswapCryptoMarketPayload } from './Payload'
import { XyoUniswapCryptoMarketWitnessConfigSchema } from './Schema'

export type XyoUniswapCryptoMarketWitnessConfig = XyoWitnessConfig<
  XyoUniswapCryptoMarketPayload,
  {
    schema: XyoUniswapCryptoMarketWitnessConfigSchema
    pools: string[]
  }
>
