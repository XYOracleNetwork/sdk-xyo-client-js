import { Provider } from '@ethersproject/providers'
import { XyoWitnessConfig } from '@xyo-network/witness'

import { XyoUniswapCryptoMarketPayload } from './Payload'
import { XyoUniswapCryptoMarketPayloadSchema, XyoUniswapCryptoMarketWitnessConfigSchema } from './Schema'

export type XyoUniswapCryptoMarketWitnessConfig = XyoWitnessConfig<
  XyoUniswapCryptoMarketPayload,
  {
    schema: XyoUniswapCryptoMarketWitnessConfigSchema
    targetSchema: XyoUniswapCryptoMarketPayloadSchema
    provider: Provider
    pools: string[]
  }
>
