import { assertEx } from '@xylabs/assert'
import { PartialWitnessConfig, XyoWitness } from '@xyo-network/witness'

import { XyoUniswapCryptoMarketWitnessConfig } from './Config'
import { createUniswapPoolContracts, EthersUniSwap3Pair, pricesFromUniswap3, UniswapPoolContracts } from './lib'
import { XyoUniswapCryptoMarketPayload } from './Payload'
import { XyoUniswapCryptoMarketSchema, XyoUniswapCryptoMarketWitnessConfigSchema } from './Schema'

export class XyoUniswapCryptoMarketWitness extends XyoWitness<XyoUniswapCryptoMarketPayload, XyoUniswapCryptoMarketWitnessConfig> {
  protected pairs: EthersUniSwap3Pair[]
  constructor(config: PartialWitnessConfig<XyoUniswapCryptoMarketWitnessConfig>) {
    super({ schema: XyoUniswapCryptoMarketWitnessConfigSchema, targetSchema: XyoUniswapCryptoMarketSchema, ...config })
    this.pairs = createUniswapPoolContracts(assertEx(this.config?.provider, 'Provider is Required'), this.config?.pools ?? UniswapPoolContracts)
  }

  override async observe(): Promise<XyoUniswapCryptoMarketPayload> {
    const pairs = await pricesFromUniswap3(this.pairs)
    const timestamp = Date.now()

    return {
      pairs,
      schema: XyoUniswapCryptoMarketSchema,
      timestamp,
    }
  }
}
