import { Provider } from '@ethersproject/providers'
import {} from '@xyo-network/crypto-wallet-nft-payload-plugin'
import { AnyConfigSchema } from '@xyo-network/modules'
import { Payload } from '@xyo-network/payload-model'
import { AbstractWitness, WitnessParams } from '@xyo-network/witness'

import { CryptoWalletNftWitnessConfig } from './Config'
import { getNftsOwnedByAddress } from './lib'

export type CryptoWalletNftWitnessParams = WitnessParams<
  AnyConfigSchema<CryptoWalletNftWitnessConfig>,
  {
    provider?: Provider
  }
>

export class CryptoWalletNftWitness<TParams extends CryptoWalletNftWitnessParams = CryptoWalletNftWitnessParams> extends AbstractWitness<TParams> {
  static override configSchema = 'TODO'

  protected get provider() {
    return this.params.provider
  }

  override async observe(): Promise<Payload[]> {
    this.started('throw')
    const nfts = await getNftsOwnedByAddress('ADDRESS', 'CHAIN')
    const timestamp = Date.now()

    const payload = {
      nfts,
      schema: 'TODO',
      timestamp,
    }

    return super.observe([payload])
  }

  override async start() {
    await super.start()
    // TODO: Auth with Infura here or each time we need to make a request?
  }
}
