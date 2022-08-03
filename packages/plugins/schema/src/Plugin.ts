import { XyoSchemaPayload } from '@xyo-network/payload'
import { createXyoPayloadPlugin, XyoPayloadPluginFunc } from '@xyo-network/payload-plugin'
import { XyoSchemaWitness } from '@xyo-network/schema-witness'

import { XyoSchemaPayloadSchema } from './Schema'

export const XyoSchemaPayloadPlugin: XyoPayloadPluginFunc<XyoSchemaPayloadSchema, XyoSchemaPayload> = () =>
  createXyoPayloadPlugin({
    schema: XyoSchemaPayloadSchema,
    witness: (): XyoSchemaWitness => {
      return new XyoSchemaWitness()
    },
  })
