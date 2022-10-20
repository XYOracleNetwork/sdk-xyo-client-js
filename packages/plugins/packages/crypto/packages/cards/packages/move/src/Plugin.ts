import { XyoModuleParams } from '@xyo-network/module'
import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoCryptoCardsMovePayload } from './Payload'
import { XyoCryptoCardsMoveSchema } from './Schema'
import { XyoXyoCryptoCardsMovePayloadTemplate } from './Template'
import { XyoCryptoCardsMoveWitness, XyoCryptoCardsMoveWitnessConfig } from './Witness'

export const XyoCryptoCardsMovePayloadPlugin = () =>
  createXyoPayloadPlugin<XyoCryptoCardsMovePayload, XyoModuleParams<XyoCryptoCardsMoveWitnessConfig>>({
    auto: true,
    schema: XyoCryptoCardsMoveSchema,
    template: XyoXyoCryptoCardsMovePayloadTemplate,
    witness: async (params) => {
      return await XyoCryptoCardsMoveWitness.create(params)
    },
  })
