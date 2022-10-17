import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoCryptoCardsGamePayload } from './Payload'
import { XyoCryptoCardsGameSchema } from './Schema'
import { XyoCryptoCardsGamePayloadTemplate } from './Template'
import { XyoCryptoCardsGameWitness, XyoCryptoCardsGameWitnessConfig } from './Witness'

export const XyoCryptoCardsGamePayloadPlugin = () =>
  createXyoPayloadPlugin<XyoCryptoCardsGamePayload, XyoCryptoCardsGameWitnessConfig>({
    auto: true,
    schema: XyoCryptoCardsGameSchema,
    template: XyoCryptoCardsGamePayloadTemplate,
    witness: async (params) => {
      return await XyoCryptoCardsGameWitness.create(params)
    },
  })
