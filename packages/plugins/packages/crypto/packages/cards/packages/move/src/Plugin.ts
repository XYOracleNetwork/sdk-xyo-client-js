import { assertEx } from '@xylabs/assert'
import { createXyoPayloadPlugin, XyoPayloadPlugin, XyoPayloadPluginFunc } from '@xyo-network/payload-plugin'

import { XyoCryptoCardsMovePayload } from './Payload'
import { XyoCryptoCardsMovePayloadSchema } from './Schema'
import { XyoXyoCryptoCardsMovePayloadTemplate } from './Template'
import { XyoCryptoCardsMoveWitness, XyoCryptoCardsMoveWitnessConfig } from './Witness'

export const XyoCryptoCardsMovePayloadPlugin: XyoPayloadPluginFunc<XyoCryptoCardsMovePayload, XyoCryptoCardsMoveWitnessConfig> = (
  config?,
): XyoPayloadPlugin<XyoCryptoCardsMovePayload> =>
  createXyoPayloadPlugin({
    auto: true,
    schema: XyoCryptoCardsMovePayloadSchema,
    template: XyoXyoCryptoCardsMovePayloadTemplate,
    witness: (): XyoCryptoCardsMoveWitness => {
      return new XyoCryptoCardsMoveWitness(assertEx(config?.witness))
    },
  })
