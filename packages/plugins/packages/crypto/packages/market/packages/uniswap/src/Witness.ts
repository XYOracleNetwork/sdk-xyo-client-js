import { Provider } from '@ethersproject/providers'
import { assertEx } from '@xylabs/sdk-js'
import { XyoWitness, XyoWitnessConfig } from '@xyo-network/witness'

import { createUniswapPoolContracts, pricesFromUniswap3, UniSwap3Pair, UniswapPoolContracts } from './lib'
import { XyoUniswapCryptoMarketPayload } from './Payload'
import { XyoUniswapCryptoMarketQueryPayload } from './Query'
import { XyoUniswapCryptoMarketPayloadSchema } from './Schema'

export interface XyoUniswapCryptoMarketWitnessConfig extends XyoWitnessConfig<XyoUniswapCryptoMarketQueryPayload> {
  provider: Provider
}

export class XyoUniswapCryptoMarketWitness extends XyoWitness<
  XyoUniswapCryptoMarketPayload,
  XyoUniswapCryptoMarketQueryPayload,
  XyoUniswapCryptoMarketWitnessConfig
> {
  protected pairs: UniSwap3Pair[]
  constructor(config: XyoUniswapCryptoMarketWitnessConfig) {
    super(config)
    this.pairs = createUniswapPoolContracts(assertEx(this.config?.provider, 'Provider is Required'), this.config.query?.pools ?? UniswapPoolContracts)
  }

  override async observe(): Promise<XyoUniswapCryptoMarketPayload> {
    const pairs = await pricesFromUniswap3(this.pairs)
    const timestamp = Date.now()

    return {
      pairs,
      schema: XyoUniswapCryptoMarketPayloadSchema,
      timestamp,
    }
  }
}
