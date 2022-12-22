import { XyoCryptoCardsGameSchema } from '@xyo-network/crypto-cards-game-payload-plugin'
import { ModuleParams } from '@xyo-network/module'
import { PayloadSetSchema } from '@xyo-network/payload-model'
import { createPayloadSetPlugin, PayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'

import { XyoCryptoCardsGameWitness, XyoCryptoCardsGameWitnessConfig } from './Witness'

export const XyoCryptoCardsGamePlugin = () =>
  createPayloadSetPlugin<PayloadSetWitnessPlugin<ModuleParams<XyoCryptoCardsGameWitnessConfig>>>(
    { required: { [XyoCryptoCardsGameSchema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        const result = await XyoCryptoCardsGameWitness.create(params)
        return result
      },
    },
  )
