import { Provider } from '@ethersproject/providers'
import { assertEx } from '@xylabs/assert'
import { XyoModuleParams } from '@xyo-network/module'
import { XyoWitness } from '@xyo-network/witness'

import { XyoUniswapCryptoMarketWitnessConfig } from './Config'
import { createUniswapPoolContracts, EthersUniSwap3Pair, pricesFromUniswap3, UniswapPoolContracts } from './lib'
import { XyoUniswapCryptoMarketPayload } from './Payload'

export interface XyoUniswapCryptoMarketWitnessParams extends XyoModuleParams<XyoUniswapCryptoMarketWitnessConfig> {
  provider: Provider
}

export class XyoUniswapCryptoMarketWitness extends XyoWitness<XyoUniswapCryptoMarketPayload, XyoUniswapCryptoMarketWitnessConfig> {
  protected pairs?: EthersUniSwap3Pair[]
  protected provider: Provider
  constructor(params: XyoUniswapCryptoMarketWitnessParams) {
    super(params)
    this.provider = params.provider
  }

  static override async create(params?: XyoModuleParams): Promise<XyoUniswapCryptoMarketWitness> {
    const module = new XyoUniswapCryptoMarketWitness(params as XyoUniswapCryptoMarketWitnessParams)
    await module.start()
    return module
  }

  override async observe(): Promise<XyoUniswapCryptoMarketPayload[]> {
    this.started('throw')
    const pairs = await pricesFromUniswap3(assertEx(this.pairs))
    const timestamp = Date.now()

    const payload: Partial<XyoUniswapCryptoMarketPayload> = {
      pairs,
      timestamp,
    }

    return super.observe([payload])
  }

  override async start() {
    this.pairs = createUniswapPoolContracts(this.provider, this.config?.pools ?? UniswapPoolContracts)
    return await super.start()
  }
}
