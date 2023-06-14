import { CryptoCardsGameSchema } from '@xyo-network/crypto-cards-game-payload-plugin'
import { PayloadSetSchema } from '@xyo-network/payload-model'
import { createPayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'

import { CryptoCardsGameWitness } from './Witness'

export const CryptoCardsGamePlugin = () =>
  createPayloadSetWitnessPlugin<CryptoCardsGameWitness>(
    { required: { [CryptoCardsGameSchema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        const result = await CryptoCardsGameWitness.create(params)
        return result as CryptoCardsGameWitness
      },
    },
  )
