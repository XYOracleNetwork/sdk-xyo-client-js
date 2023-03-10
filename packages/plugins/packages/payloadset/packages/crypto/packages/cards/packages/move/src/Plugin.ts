import { XyoCryptoCardsMoveSchema } from '@xyo-network/crypto-cards-move-payload-plugin'
import { PayloadSetSchema } from '@xyo-network/payload-model'
import { createPayloadSetPlugin, PayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'

import { XyoCryptoCardsMoveWitness } from './Witness'

export const XyoCryptoCardsMovePlugin = () =>
  createPayloadSetPlugin<PayloadSetWitnessPlugin<XyoCryptoCardsMoveWitness>>(
    { required: { [XyoCryptoCardsMoveSchema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        return await XyoCryptoCardsMoveWitness.create(params)
      },
    },
  )
