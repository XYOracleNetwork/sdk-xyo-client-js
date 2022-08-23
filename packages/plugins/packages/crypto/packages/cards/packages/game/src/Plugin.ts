import { assertEx } from '@xylabs/assert'
import { createXyoPayloadPlugin, XyoPayloadPlugin, XyoPayloadPluginConfig, XyoPayloadPluginFunc } from '@xyo-network/payload-plugin'

import { XyoCryptoCardsGamePayload } from './Payload'
import { XyoCryptoCardsGamePayloadSchema, XyoCryptoCardsGameWitnessConfigSchema } from './Schema'
import { XyoCryptoCardsGamePayloadTemplate } from './Template'
import { XyoCryptoCardsGameWitness, XyoCryptoCardsGameWitnessConfig } from './Witness'

export const XyoCryptoCardsGamePayloadPlugin: XyoPayloadPluginFunc<
  XyoCryptoCardsGamePayload,
  XyoCryptoCardsGameWitnessConfigSchema,
  XyoPayloadPluginConfig<XyoCryptoCardsGamePayload, XyoCryptoCardsGameWitnessConfigSchema, XyoCryptoCardsGameWitnessConfig>
> = (config?): XyoPayloadPlugin<XyoCryptoCardsGamePayload> =>
  createXyoPayloadPlugin({
    auto: true,
    schema: XyoCryptoCardsGamePayloadSchema,
    template: XyoCryptoCardsGamePayloadTemplate,
    witness: (): XyoCryptoCardsGameWitness => {
      return new XyoCryptoCardsGameWitness(assertEx(config?.witness))
    },
  })
