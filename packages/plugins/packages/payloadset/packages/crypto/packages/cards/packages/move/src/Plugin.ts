import { CryptoCardsMoveSchema } from '@xyo-network/crypto-cards-move-payload-plugin'
import { PayloadSetSchema } from '@xyo-network/payload-model'
import { createPayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'

import { CryptoCardsMoveWitness } from './Witness'

export const CryptoCardsMovePlugin = () =>
  createPayloadSetWitnessPlugin<CryptoCardsMoveWitness>(
    { required: { [CryptoCardsMoveSchema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        return await CryptoCardsMoveWitness.create(params)
      },
    },
  )
