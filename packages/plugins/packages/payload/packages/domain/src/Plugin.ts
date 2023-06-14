import { Payload } from '@xyo-network/payload-model'
import { createPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoDomainPayload } from './Payload'
import { XyoDomainSchema } from './Schema'
import { domainConfigTemplate } from './Template'
import { XyoDomainPayloadWrapper } from './Wrapper'

export const DomainPayloadPlugin = () =>
  createPayloadPlugin<XyoDomainPayload>({
    schema: XyoDomainSchema,
    template: domainConfigTemplate,
    wrap: (payload: Payload) => XyoDomainPayloadWrapper.wrap(payload as XyoDomainPayload),
  })
