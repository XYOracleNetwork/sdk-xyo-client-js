import { Provider } from '@ethersproject/providers'
import { assertEx } from '@xylabs/assert'
import { XyoAccount } from '@xyo-network/account'
import { XyoModuleParams } from '@xyo-network/module'
import { XyoWitness } from '@xyo-network/witness'

import { XyoUniswapCryptoMarketWitnessConfig } from './Config'
import { createUniswapPoolContracts, EthersUniSwap3Pair, pricesFromUniswap3, UniswapPoolContracts } from './lib'
import { XyoUniswapCryptoMarketPayload } from './Payload'
import { XyoUniswapCryptoMarketSchema } from './Schema'

export interface XyoUniswapCryptoMarketWitnessParams<TConfig extends XyoUniswapCryptoMarketWitnessConfig = XyoUniswapCryptoMarketWitnessConfig>
  extends XyoModuleParams<TConfig> {
  provider: Provider
}

export class XyoUniswapCryptoMarketWitness extends XyoWitness<XyoUniswapCryptoMarketPayload, XyoUniswapCryptoMarketWitnessConfig> {
  protected pairs?: EthersUniSwap3Pair[]
  protected provider: Provider
  constructor(params: XyoUniswapCryptoMarketWitnessParams) {
    super(params)
    this.provider = params.provider
  }

  override async observe(): Promise<XyoUniswapCryptoMarketPayload[]> {
    this.checkInitialized('Observe')
    const pairs = await pricesFromUniswap3(assertEx(this.pairs))
    const timestamp = Date.now()

    return [
      {
        pairs,
        schema: XyoUniswapCryptoMarketSchema,
        timestamp,
      },
    ]
  }

  override async initialize(config?: XyoUniswapCryptoMarketWitnessConfig, _queryAccount?: XyoAccount | undefined) {
    await super.initialize(config)
    this.pairs = createUniswapPoolContracts(this.provider, this.config?.pools ?? UniswapPoolContracts)
  }
}
