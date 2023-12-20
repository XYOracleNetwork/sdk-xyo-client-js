import { Payload } from '@xyo-network/payload-model'
import { createPayloadPlugin } from '@xyo-network/payload-plugin'

import { DomainPayload } from './Payload'
import { DomainSchema } from './Schema'
import { domainConfigTemplate } from './Template'
import { DomainPayloadWrapper } from './Wrapper'

export const DomainPayloadPlugin = () =>
  createPayloadPlugin<DomainPayload>({
    schema: DomainSchema,
    template: domainConfigTemplate,
    wrap: (payload: Payload) => DomainPayloadWrapper.wrap(payload as DomainPayload),
  })
