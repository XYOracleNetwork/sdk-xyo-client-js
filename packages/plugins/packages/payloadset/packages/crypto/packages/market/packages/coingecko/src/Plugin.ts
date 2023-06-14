import { CoingeckoCryptoMarketSchema } from '@xyo-network/coingecko-crypto-market-payload-plugin'
import { PayloadSetSchema } from '@xyo-network/payload-model'
import { createPayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'

import { CoingeckoCryptoMarketWitness } from './Witness'

export const CoingeckoCryptoMarketPlugin = () =>
  createPayloadSetWitnessPlugin<CoingeckoCryptoMarketWitness>(
    { required: { [CoingeckoCryptoMarketSchema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        const result = await CoingeckoCryptoMarketWitness.create(params)
        return result
      },
    },
  )
