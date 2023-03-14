import { XyoCryptoCardsMoveSchema } from '@xyo-network/crypto-cards-move-payload-plugin'
import { PayloadSetSchema } from '@xyo-network/payload-model'
import { createPayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'

import { XyoCryptoCardsMoveWitness } from './Witness'

export const XyoCryptoCardsMovePlugin = () =>
  createPayloadSetWitnessPlugin<XyoCryptoCardsMoveWitness>(
    { required: { [XyoCryptoCardsMoveSchema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        return await XyoCryptoCardsMoveWitness.create(params)
      },
    },
  )
