import { AddressTransactionHistorySchema } from '@xyo-network/crypto-address-transaction-history-payload-plugin'
import { PayloadSetSchema } from '@xyo-network/payload-model'
import { createPayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'

import { AddressTransactionHistoryWitness } from './Witness'

export const AddressTransactionHistoryPlugin = () =>
  createPayloadSetWitnessPlugin<AddressTransactionHistoryWitness>(
    { required: { [AddressTransactionHistorySchema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        const result = await AddressTransactionHistoryWitness.create(params)
        return result
      },
    },
  )
