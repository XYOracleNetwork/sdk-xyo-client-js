import { Provider } from '@ethersproject/providers'
import { assertEx } from '@xylabs/assert'
import { AnyConfigSchema, ModuleEventData } from '@xyo-network/modules'
import { XyoPayload } from '@xyo-network/payload-model'
import {
  XyoUniswapCryptoMarketPayload,
  XyoUniswapCryptoMarketSchema,
  XyoUniswapCryptoMarketWitnessConfigSchema,
} from '@xyo-network/uniswap-crypto-market-payload-plugin'
import { AbstractWitness, WitnessParams } from '@xyo-network/witness'

import { XyoUniswapCryptoMarketWitnessConfig } from './Config'
import { createUniswapPoolContracts, EthersUniSwap3Pair, pricesFromUniswap3, UniswapPoolContracts } from './lib'

export type XyoUniswapCryptoMarketWitnessParams = WitnessParams<
  AnyConfigSchema<XyoUniswapCryptoMarketWitnessConfig>,
  ModuleEventData,
  {
    provider?: Provider
  }
>

export class XyoUniswapCryptoMarketWitness<
  TParams extends XyoUniswapCryptoMarketWitnessParams = XyoUniswapCryptoMarketWitnessParams,
> extends AbstractWitness<TParams> {
  static override configSchema = XyoUniswapCryptoMarketWitnessConfigSchema

  protected pairs?: EthersUniSwap3Pair[]
  protected get provider() {
    return this.params.provider
  }

  static override async create<TParams extends XyoUniswapCryptoMarketWitnessParams>(params?: TParams) {
    return (await super.create(params)) as XyoUniswapCryptoMarketWitness<TParams>
  }

  override async observe(): Promise<XyoPayload[]> {
    this.started('throw')
    const pairs = await pricesFromUniswap3(assertEx(this.pairs))
    const timestamp = Date.now()

    const payload: XyoUniswapCryptoMarketPayload = {
      pairs,
      schema: XyoUniswapCryptoMarketSchema,
      timestamp,
    }

    return super.observe([payload])
  }

  override async start() {
    this.pairs = createUniswapPoolContracts(assertEx(this.provider, 'Provider Required'), this.config?.pools ?? UniswapPoolContracts)
    return await super.start()
  }
}
