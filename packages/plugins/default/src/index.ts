import { XyoPayload, XyoPayloadValidator, XyoPayloadWrapper } from '@xyo-network/payload'
import { createXyoPayloadPlugin, XyoPayloadPlugin } from '@xyo-network/payload-plugin'

const plugin: XyoPayloadPlugin<'network.xyo.payload', XyoPayload> = createXyoPayloadPlugin<'network.xyo.payload', XyoPayload>({
  schema: 'network.xyo.payload',
  validate: function (payload: XyoPayload): XyoPayloadValidator<XyoPayload> {
    return new XyoPayloadValidator(payload)
  },
  wrap: function (payload: XyoPayload): XyoPayloadWrapper<XyoPayload> {
    return new XyoPayloadWrapper(payload)
  },
})

// eslint-disable-next-line import/no-default-export
export default plugin
