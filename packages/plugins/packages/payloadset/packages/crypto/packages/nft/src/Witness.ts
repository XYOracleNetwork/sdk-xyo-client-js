import { Provider } from '@ethersproject/providers'
import { AnyConfigSchema } from '@xyo-network/modules'
import { Payload } from '@xyo-network/payload-model'
import { UniswapCryptoMarketSchema, UniswapCryptoMarketWitnessConfigSchema } from '@xyo-network/uniswap-crypto-market-payload-plugin'
import { AbstractWitness, WitnessParams } from '@xyo-network/witness'

import { UniswapCryptoMarketWitnessConfig } from './Config'
import { getNftsOwnedByAddress } from './lib'

export type UniswapCryptoMarketWitnessParams = WitnessParams<
  AnyConfigSchema<UniswapCryptoMarketWitnessConfig>,
  {
    provider?: Provider
  }
>

export class UniswapCryptoMarketWitness<
  TParams extends UniswapCryptoMarketWitnessParams = UniswapCryptoMarketWitnessParams,
> extends AbstractWitness<TParams> {
  static override configSchema = UniswapCryptoMarketWitnessConfigSchema

  protected get provider() {
    return this.params.provider
  }

  override async observe(): Promise<Payload[]> {
    this.started('throw')
    const nfts = await getNftsOwnedByAddress('ADDRESS', 'CHAIN')
    const timestamp = Date.now()

    const payload = {
      schema: UniswapCryptoMarketSchema,
      timestamp,
    }

    return super.observe([payload])
  }

  override async start() {
    await super.start()
    // TODO: Auth with Infura here or each time we need to make a request?
  }
}
