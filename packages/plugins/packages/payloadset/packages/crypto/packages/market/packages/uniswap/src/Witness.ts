import { Provider } from '@ethersproject/providers'
import { assertEx } from '@xylabs/assert'
import { AnyConfigSchema } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'
import {
  UniswapCryptoMarketPayload,
  UniswapCryptoMarketSchema,
  UniswapCryptoMarketWitnessConfigSchema,
} from '@xyo-network/uniswap-crypto-market-payload-plugin'
import { AbstractWitness, WitnessParams } from '@xyo-network/witness'

import { UniswapCryptoMarketWitnessConfig } from './Config'
import { createUniswapPoolContracts, EthersUniSwap3Pair, pricesFromUniswap3, UniswapPoolContracts } from './lib'

export type UniswapCryptoMarketWitnessParams = WitnessParams<
  AnyConfigSchema<UniswapCryptoMarketWitnessConfig>,
  {
    provider?: Provider
  }
>

export class UniswapCryptoMarketWitness<
  TParams extends UniswapCryptoMarketWitnessParams = UniswapCryptoMarketWitnessParams,
> extends AbstractWitness<TParams> {
  static override configSchemas = [UniswapCryptoMarketWitnessConfigSchema]

  protected pairs?: EthersUniSwap3Pair[]
  protected get provider() {
    return this.params.provider
  }

  protected override async observeHandler(): Promise<Payload[]> {
    await this.started('throw')
    const pairs = await pricesFromUniswap3(assertEx(this.pairs))
    const timestamp = Date.now()

    const payload: UniswapCryptoMarketPayload = {
      pairs,
      schema: UniswapCryptoMarketSchema,
      timestamp,
    }

    return [payload]
  }

  protected override async startHandler() {
    await super.startHandler()
    this.pairs = createUniswapPoolContracts(assertEx(this.provider, 'Provider Required'), this.config?.pools ?? UniswapPoolContracts)
    return true
  }
}
