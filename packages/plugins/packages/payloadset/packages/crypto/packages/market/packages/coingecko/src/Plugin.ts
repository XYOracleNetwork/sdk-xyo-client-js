import { XyoCoingeckoCryptoMarketSchema } from '@xyo-network/coingecko-crypto-market-payload-plugin'
import { PayloadSetSchema } from '@xyo-network/payload-model'
import { createPayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'

import { XyoCoingeckoCryptoMarketWitness } from './Witness'

export const XyoCoingeckoCryptoMarketPlugin = () =>
  createPayloadSetWitnessPlugin<XyoCoingeckoCryptoMarketWitness>(
    { required: { [XyoCoingeckoCryptoMarketSchema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        const result = await XyoCoingeckoCryptoMarketWitness.create(params)
        return result
      },
    },
  )
