import { Payload } from '@xyo-network/payload-model'
import { createPayloadPlugin } from '@xyo-network/payload-plugin'

import { DomainPayload } from './Payload.js'
import { DomainSchema } from './Schema.js'
import { domainConfigTemplate } from './Template.js'
import { DomainPayloadWrapper } from './Wrapper.js'

export const DomainPayloadPlugin = () =>
  createPayloadPlugin<DomainPayload>({
    schema: DomainSchema,
    template: domainConfigTemplate,
    wrap: (payload: Payload) => DomainPayloadWrapper.wrap(payload as DomainPayload),
  })
