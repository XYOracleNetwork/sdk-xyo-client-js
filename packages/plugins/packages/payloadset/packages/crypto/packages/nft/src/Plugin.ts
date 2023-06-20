import { PayloadSetSchema } from '@xyo-network/payload-model'
import { createPayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'
import { UniswapCryptoMarketSchema } from '@xyo-network/uniswap-crypto-market-payload-plugin'

import { UniswapCryptoMarketWitness } from './Witness'

export const UniswapCryptoMarketPlugin = () =>
  createPayloadSetWitnessPlugin<UniswapCryptoMarketWitness>(
    { required: { [UniswapCryptoMarketSchema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        const result = await UniswapCryptoMarketWitness.create(params)
        return result
      },
    },
  )
