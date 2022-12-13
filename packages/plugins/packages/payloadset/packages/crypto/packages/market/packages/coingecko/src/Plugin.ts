import { XyoCoingeckoCryptoMarketSchema } from '@xyo-network/coingecko-crypto-market-payload-plugin'
import { ModuleParams } from '@xyo-network/module'
import { PayloadSetSchema } from '@xyo-network/payload'
import { createPayloadSetPlugin, PayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'

import { XyoCoingeckoCryptoMarketWitnessConfig } from './Config'
import { XyoCoingeckoCryptoMarketWitness } from './Witness'

export const XyoCoingeckoCryptoMarketPlugin = () =>
  createPayloadSetPlugin<PayloadSetWitnessPlugin<ModuleParams<XyoCoingeckoCryptoMarketWitnessConfig>>>(
    { required: { [XyoCoingeckoCryptoMarketSchema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        const result = await XyoCoingeckoCryptoMarketWitness.create(params)
        return result
      },
    },
  )
