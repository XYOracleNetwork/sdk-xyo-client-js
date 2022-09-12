import { createXyoPayloadPlugin, XyoPayloadPlugin, XyoPayloadPluginFunc } from '@xyo-network/payload-plugin'

import { XyoCryptoCardsGamePayload } from './Payload'
import { XyoCryptoCardsGameSchema, XyoCryptoCardsGameWitnessConfigSchema } from './Schema'
import { XyoCryptoCardsGamePayloadTemplate } from './Template'
import { XyoCryptoCardsGameWitness, XyoCryptoCardsGameWitnessConfig } from './Witness'

export const XyoCryptoCardsGamePayloadPlugin: XyoPayloadPluginFunc<XyoCryptoCardsGamePayload, XyoCryptoCardsGameWitnessConfig> = (): XyoPayloadPlugin<
  XyoCryptoCardsGamePayload,
  XyoCryptoCardsGameWitnessConfig
> =>
  createXyoPayloadPlugin<XyoCryptoCardsGamePayload, XyoCryptoCardsGameWitnessConfig>({
    auto: true,
    schema: XyoCryptoCardsGameSchema,
    template: XyoCryptoCardsGamePayloadTemplate,
    witness: (config): XyoCryptoCardsGameWitness => {
      return new XyoCryptoCardsGameWitness({
        ...config,
        schema: XyoCryptoCardsGameWitnessConfigSchema,
        targetSchema: XyoCryptoCardsGameSchema,
      })
    },
  })
