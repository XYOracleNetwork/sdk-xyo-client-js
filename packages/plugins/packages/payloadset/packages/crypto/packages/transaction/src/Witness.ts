import type { ExternalProvider, JsonRpcFetchFunc } from '@ethersproject/providers'
import { assertEx } from '@xylabs/assert'
import {
  AddressTransactionHistoryPayload,
  AddressTransactionHistorySchema,
  AddressTransactionHistoryWitnessConfigSchema,
} from '@xyo-network/crypto-wallet-nft-payload-plugin'
import { AnyConfigSchema } from '@xyo-network/modules'
import { Payload } from '@xyo-network/payload-model'
import { AbstractWitness, WitnessParams } from '@xyo-network/witness'

import { AddressTransactionHistoryWitnessConfig } from './Config'
import { getNftsOwnedByAddress } from './lib'

export type AddressTransactionHistoryWitnessParams = WitnessParams<
  AnyConfigSchema<AddressTransactionHistoryWitnessConfig>,
  {
    provider?: ExternalProvider | JsonRpcFetchFunc
  }
>

const schema = AddressTransactionHistorySchema

export class AddressTransactionHistoryWitness<
  TParams extends AddressTransactionHistoryWitnessParams = AddressTransactionHistoryWitnessParams,
> extends AbstractWitness<TParams> {
  static override configSchema = AddressTransactionHistoryWitnessConfigSchema

  protected get provider() {
    return assertEx(this.params.provider, 'Provider Required')
  }

  override async observe(): Promise<Payload[]> {
    this.started('throw')
    const address = assertEx(this.config.address, 'params.address is required')
    const chainId = assertEx(this.config.chainId, 'params.chainId is required')
    const nfts = await getNftsOwnedByAddress(address, chainId, this.provider)
    const timestamp = Date.now()
    const payload: AddressTransactionHistoryPayload = { address, chainId, nfts, schema, timestamp }
    return super.observe([payload])
  }

  override async start() {
    await super.start()
  }
}
