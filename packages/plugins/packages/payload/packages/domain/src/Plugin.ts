import { XyoPayload } from '@xyo-network/payload'
import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoDomainPayload } from './Payload'
import { XyoDomainSchema } from './Schema'
import { domainConfigTemplate } from './Template'
import { XyoDomainPayloadWrapper } from './Wrapper'

export const DomainPayloadPlugin = () =>
  createXyoPayloadPlugin<XyoDomainPayload>({
    schema: XyoDomainSchema,
    template: domainConfigTemplate,
    wrap: (payload: XyoPayload) => new XyoDomainPayloadWrapper(payload as XyoDomainPayload),
  })
