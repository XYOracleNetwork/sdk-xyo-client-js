import { assertEx } from '@xylabs/assert'
import { createXyoPayloadPlugin, XyoPayloadPluginConfig, XyoPayloadPluginFunc } from '@xyo-network/payload-plugin'

import { XyoCryptoCardsMovePayload } from './Payload'
import { XyoCryptoCardsMovePayloadSchema, XyoCryptoCardsMoveWitnessConfigSchema } from './Schema'
import { XyoXyoCryptoCardsMovePayloadTemplate } from './Template'
import { XyoCryptoCardsMoveWitness, XyoCryptoCardsMoveWitnessConfig } from './Witness'

export const XyoCryptoCardsMovePayloadPlugin: XyoPayloadPluginFunc<
  XyoCryptoCardsMovePayloadSchema,
  XyoCryptoCardsMovePayload,
  XyoCryptoCardsMoveWitnessConfigSchema,
  XyoPayloadPluginConfig<XyoCryptoCardsMovePayloadSchema, XyoCryptoCardsMoveWitnessConfigSchema, XyoCryptoCardsMoveWitnessConfig>
> = (config?) =>
  createXyoPayloadPlugin({
    auto: true,
    schema: XyoCryptoCardsMovePayloadSchema,
    template: XyoXyoCryptoCardsMovePayloadTemplate,
    witness: (): XyoCryptoCardsMoveWitness => {
      return new XyoCryptoCardsMoveWitness(assertEx(config?.witness))
    },
  })
