import { PayloadSetSchema } from '@xyo-network/payload-model'
import { createPayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'
import { XyoUniswapCryptoMarketSchema } from '@xyo-network/uniswap-crypto-market-payload-plugin'

import { XyoUniswapCryptoMarketWitness } from './Witness'

export const XyoUniswapCryptoMarketPlugin = () =>
  createPayloadSetWitnessPlugin<XyoUniswapCryptoMarketWitness>(
    { required: { [XyoUniswapCryptoMarketSchema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        const result = await XyoUniswapCryptoMarketWitness.create(params)
        return result
      },
    },
  )
