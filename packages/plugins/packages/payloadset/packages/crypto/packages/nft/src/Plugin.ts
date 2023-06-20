import { PayloadSetSchema } from '@xyo-network/payload-model'
import { createPayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'
import { UniswapCryptoMarketSchema } from '@xyo-network/uniswap-crypto-market-payload-plugin'

import { CryptoWalletNftWitness } from './Witness'

export const CryptoWalletNftPlugin = () =>
  createPayloadSetWitnessPlugin<CryptoWalletNftWitness>(
    { required: { [UniswapCryptoMarketSchema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        const result = await CryptoWalletNftWitness.create(params)
        return result
      },
    },
  )
