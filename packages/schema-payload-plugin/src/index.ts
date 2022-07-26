import { XyoPayloadValidator, XyoPayloadWrapper, XyoSchemaPayload } from '@xyo-network/payload'
import { createXyoPayloadPlugin, XyoPayloadPlugin } from '@xyo-network/payload-plugin'
import { XyoSchemaWitness } from '@xyo-network/schema-witness'

const plugin: XyoPayloadPlugin<'network.xyo.schema', XyoSchemaPayload> = createXyoPayloadPlugin<'network.xyo.schema', XyoSchemaPayload>({
  schema: 'network.xyo.schema',
  validate: function (payload: XyoSchemaPayload): XyoPayloadValidator<XyoSchemaPayload> {
    return new XyoPayloadValidator(payload)
  },
  witness: function (): XyoSchemaWitness {
    return new XyoSchemaWitness()
  },
  wrap: function (payload: XyoSchemaPayload): XyoPayloadWrapper<XyoSchemaPayload> {
    return new XyoPayloadWrapper(payload)
  },
})

// eslint-disable-next-line import/no-default-export
export default plugin
