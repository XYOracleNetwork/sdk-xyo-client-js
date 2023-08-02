import { NftSchema } from '@xyo-network/crypto-nft-payload-plugin'
import { PayloadSetSchema } from '@xyo-network/payload-model'
import { createPayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'

import { CryptoWalletNftWitness } from './Witness'

export const CryptoWalletNftWitnessPlugin = () =>
  createPayloadSetWitnessPlugin<CryptoWalletNftWitness>(
    { required: { [NftSchema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        const result = await CryptoWalletNftWitness.create(params)
        return result
      },
    },
  )
