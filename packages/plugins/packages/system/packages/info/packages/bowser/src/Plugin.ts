import { assertEx } from '@xylabs/assert'
import { createXyoPayloadPlugin, XyoPayloadPlugin, XyoPayloadPluginFunc } from '@xyo-network/payload-plugin'

import { XyoBowserSystemInfoPayload } from './Payload'
import { XyoBowserSystemInfoPayloadSchema } from './Schema'
import { XyoBowserSystemInfoPayloadTemplate } from './Template'
import { XyoBowserSystemInfoWitness } from './Witness'

export const XyoBowserSystemInfoPayloadPlugin: XyoPayloadPluginFunc<XyoBowserSystemInfoPayload> = (
  config?,
): XyoPayloadPlugin<XyoBowserSystemInfoPayload> =>
  createXyoPayloadPlugin({
    auto: true,
    schema: XyoBowserSystemInfoPayloadSchema,
    template: XyoBowserSystemInfoPayloadTemplate,
    witness: (): XyoBowserSystemInfoWitness => {
      return new XyoBowserSystemInfoWitness(assertEx(config?.witness, 'Missing config'))
    },
  })
