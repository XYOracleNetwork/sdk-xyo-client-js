import { createXyoPayloadPlugin, XyoPayloadPluginFunc } from '@xyo-network/payload-plugin'

import { XyoLocationPayload } from './Payload'
import { XyoLocationPayloadSchema } from './Schema'
import { XyoLocationPayloadTemplate } from './Template'
import { XyoLocationWitness } from './Witness'

export const XyoLocationPayloadPlugin: XyoPayloadPluginFunc<XyoLocationPayloadSchema, XyoLocationPayload> = () =>
  createXyoPayloadPlugin({
    auto: true,
    schema: XyoLocationPayloadSchema,
    template: XyoLocationPayloadTemplate,
    witness: (): XyoLocationWitness => {
      return new XyoLocationWitness()
    },
  })
