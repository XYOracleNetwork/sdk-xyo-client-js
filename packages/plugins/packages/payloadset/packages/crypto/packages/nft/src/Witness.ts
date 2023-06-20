import { Provider } from '@ethersproject/providers'
import { assertEx } from '@xylabs/assert'
import { CryptoWalletNftPayload, CryptoWalletNftSchema, CryptoWalletNftWitnessConfigSchema } from '@xyo-network/crypto-wallet-nft-payload-plugin'
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
  static override configSchema = CryptoWalletNftWitnessConfigSchema

  protected get provider() {
    return this.params.provider
  }

  override async observe(): Promise<Payload[]> {
    this.started('throw')
    const address = assertEx(this.config.address, 'params.address is required')
    const chainId = assertEx(this.config.chainId, 'params.chain is required')
    const network = assertEx(this.config.network, 'params.network is required')
    const provider = assertEx(this.provider, 'params.provider is required')
    const nfts = await getNftsOwnedByAddress(address, network, chainId, provider)
    const timestamp = Date.now()

    const payload: CryptoWalletNftPayload = { address, chainId, network, nfts, schema: CryptoWalletNftSchema, timestamp }

    return super.observe([payload])
  }

  override async start() {
    await super.start()
    // TODO: Auth with Infura here or each time we need to make a request?
  }
}
