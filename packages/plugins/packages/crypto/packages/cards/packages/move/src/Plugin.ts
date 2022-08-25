import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoCryptoCardsMovePayload } from './Payload'
import { XyoCryptoCardsMovePayloadSchema } from './Schema'
import { XyoXyoCryptoCardsMovePayloadTemplate } from './Template'
import { XyoCryptoCardsMoveWitness, XyoCryptoCardsMoveWitnessConfig } from './Witness'

export const XyoCryptoCardsMovePayloadPlugin = () =>
  createXyoPayloadPlugin<XyoCryptoCardsMovePayload, XyoCryptoCardsMoveWitnessConfig>({
    auto: true,
    schema: XyoCryptoCardsMovePayloadSchema,
    template: XyoXyoCryptoCardsMovePayloadTemplate,
    witness: (config) => {
      return new XyoCryptoCardsMoveWitness(config)
    },
  })
