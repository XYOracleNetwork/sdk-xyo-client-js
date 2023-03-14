import { XyoCryptoCardsGameSchema } from '@xyo-network/crypto-cards-game-payload-plugin'
import { PayloadSetSchema } from '@xyo-network/payload-model'
import { createPayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'

import { XyoCryptoCardsGameWitness } from './Witness'

export const XyoCryptoCardsGamePlugin = () =>
  createPayloadSetWitnessPlugin<XyoCryptoCardsGameWitness>(
    { required: { [XyoCryptoCardsGameSchema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        const result = await XyoCryptoCardsGameWitness.create(params)
        return result as XyoCryptoCardsGameWitness
      },
    },
  )
