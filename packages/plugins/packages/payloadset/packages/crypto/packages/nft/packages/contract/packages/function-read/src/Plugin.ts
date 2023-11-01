import { NftSchema } from '@xyo-network/crypto-nft-payload-plugin'
import { PayloadSetSchema } from '@xyo-network/payload-model'
import { createPayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'

import { CryptoContractFunctionReadWitness } from './Witness'

export const CryptoContractFunctionReadWitnessPlugin = () =>
  createPayloadSetWitnessPlugin<CryptoContractFunctionReadWitness>(
    { required: { [NftSchema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        const result = await CryptoContractFunctionReadWitness.create(params)
        return result
      },
    },
  )
