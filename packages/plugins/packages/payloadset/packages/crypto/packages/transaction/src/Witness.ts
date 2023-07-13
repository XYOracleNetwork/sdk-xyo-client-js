import type { EtherscanProvider } from '@ethersproject/providers'
import { assertEx } from '@xylabs/assert'
import {
  AddressTransactionHistoryPayload,
  AddressTransactionHistorySchema,
  AddressTransactionHistoryWitnessConfigSchema,
} from '@xyo-network/crypto-address-transaction-history-payload-plugin'
import { AnyConfigSchema } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'
import { AbstractWitness, WitnessParams } from '@xyo-network/witness'

import { AddressTransactionHistoryWitnessConfig } from './Config'
import { getTransactionsForAddress } from './lib'

export type AddressTransactionHistoryWitnessParams = WitnessParams<
  AnyConfigSchema<AddressTransactionHistoryWitnessConfig>,
  {
    provider?: EtherscanProvider
  }
>

const schema = AddressTransactionHistorySchema

export class AddressTransactionHistoryWitness<
  TParams extends AddressTransactionHistoryWitnessParams = AddressTransactionHistoryWitnessParams,
> extends AbstractWitness<TParams> {
  static override configSchemas = [AddressTransactionHistoryWitnessConfigSchema]

  protected get provider() {
    return assertEx(this.params.provider, 'Provider Required')
  }

  override async start() {
    await super.start()
  }

  protected override async observeHandler(): Promise<Payload[]> {
    this.started('throw')
    const address = assertEx(this.config.address, 'params.address is required')
    const transactions = await getTransactionsForAddress(address, this.provider)
    const payloads = transactions.map<AddressTransactionHistoryPayload>((transaction) => {
      return { ...transaction, schema }
    })
    return payloads
  }
}
