import { CryptoWalletNftSchema } from '@xyo-network/crypto-wallet-nft-payload-plugin'
import { PayloadSetSchema } from '@xyo-network/payload-model'
import { createPayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'

import { CryptoWalletNftWitness } from './Witness'

export const CryptoWalletNftPlugin = () =>
  createPayloadSetWitnessPlugin<CryptoWalletNftWitness>(
    { required: { [CryptoWalletNftSchema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        const result = await CryptoWalletNftWitness.create(params)
        return result
      },
    },
  )
