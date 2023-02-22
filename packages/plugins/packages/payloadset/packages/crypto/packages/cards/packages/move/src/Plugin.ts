import { XyoCryptoCardsMoveSchema } from '@xyo-network/crypto-cards-move-payload-plugin'
import { ModuleParams } from '@xyo-network/module'
import { PayloadSetSchema } from '@xyo-network/payload-model'
import { createPayloadSetPlugin, PayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'

import { XyoCryptoCardsMoveWitness, XyoCryptoCardsMoveWitnessConfig } from './Witness'

export const XyoCryptoCardsMovePlugin = () =>
  createPayloadSetPlugin<PayloadSetWitnessPlugin<XyoCryptoCardsMoveWitness, ModuleParams<XyoCryptoCardsMoveWitnessConfig>>>(
    { required: { [XyoCryptoCardsMoveSchema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        return await XyoCryptoCardsMoveWitness.create(params)
      },
    },
  )
