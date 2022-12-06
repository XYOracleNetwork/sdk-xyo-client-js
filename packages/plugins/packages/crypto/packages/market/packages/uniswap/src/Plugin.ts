import { PayloadSetSchema } from '@xyo-network/payload'
import { createPayloadSetPlugin, PayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'

import { XyoUniswapCryptoMarketSchema } from './Schema'
import { XyoUniswapCryptoMarketWitness, XyoUniswapCryptoMarketWitnessParams } from './Witness'

export const XyoUniswapCryptoMarketPlugin = () =>
  createPayloadSetPlugin<PayloadSetWitnessPlugin<XyoUniswapCryptoMarketWitnessParams>>(
    { required: { [XyoUniswapCryptoMarketSchema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        const result = await XyoUniswapCryptoMarketWitness.create(params)
        return result
      },
    },
  )
