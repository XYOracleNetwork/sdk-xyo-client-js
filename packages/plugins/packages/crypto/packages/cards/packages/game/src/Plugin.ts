import { assertEx } from '@xylabs/assert'
import { createXyoPayloadPlugin, XyoPayloadPluginFunc } from '@xyo-network/payload-plugin'

import { XyoCryptoCardsGamePayload } from './Payload'
import { XyoCryptoCardsGamePayloadSchema } from './Schema'
import { XyoCryptoCardsGamePayloadTemplate } from './Template'
import { XyoCryptoCardsGameWitness } from './Witness'

export const XyoCryptoCardsGamePayloadPlugin: XyoPayloadPluginFunc<XyoCryptoCardsGamePayloadSchema, XyoCryptoCardsGamePayload> = (config?) =>
  createXyoPayloadPlugin({
    auto: true,
    schema: XyoCryptoCardsGamePayloadSchema,
    template: XyoCryptoCardsGamePayloadTemplate,
    witness: (): XyoCryptoCardsGameWitness => {
      return new XyoCryptoCardsGameWitness(assertEx(config?.witness))
    },
  })
