import { XyoDomainConfigWitness, XyoDomainPayload } from '@xyo-network/domain'
import { XyoPayloadValidator, XyoPayloadWrapper } from '@xyo-network/payload'
import { createXyoPayloadPlugin, XyoPayloadPlugin } from '@xyo-network/payload-plugin'

const plugin: XyoPayloadPlugin<'network.xyo.domain', XyoDomainPayload> = createXyoPayloadPlugin<'network.xyo.domain', XyoDomainPayload>({
  schema: 'network.xyo.domain',
  validate: function (payload: XyoDomainPayload): XyoPayloadValidator<XyoDomainPayload> {
    return new XyoPayloadValidator(payload)
  },
  witness: function (): XyoDomainConfigWitness {
    return new XyoDomainConfigWitness()
  },
  wrap: function (payload: XyoDomainPayload): XyoPayloadWrapper<XyoDomainPayload> {
    return new XyoPayloadWrapper(payload)
  },
})

// eslint-disable-next-line import/no-default-export
export default plugin
