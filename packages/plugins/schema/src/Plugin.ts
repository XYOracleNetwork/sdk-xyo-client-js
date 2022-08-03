import { XyoSchemaPayload } from '@xyo-network/payload'
import { createXyoPayloadPlugin, XyoPayloadPluginFunc } from '@xyo-network/payload-plugin'

import { XyoSchemaPayloadSchema } from './Schema'
import { XyoSchemaWitness } from './Witness'

export const XyoSchemaPayloadPlugin: XyoPayloadPluginFunc<XyoSchemaPayloadSchema, XyoSchemaPayload> = () =>
  createXyoPayloadPlugin({
    schema: XyoSchemaPayloadSchema,
    witness: (): XyoSchemaWitness => {
      return new XyoSchemaWitness()
    },
  })
