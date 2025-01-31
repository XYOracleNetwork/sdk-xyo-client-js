import type { Payload } from '@xyo-network/payload-model'
import type { PayloadPluginFunc } from '@xyo-network/payload-plugin'
import { createPayloadPlugin } from '@xyo-network/payload-plugin'

import type { DomainPayload } from './Payload.ts'
import { DomainSchema } from './Schema.ts'
import { domainConfigTemplate } from './Template.ts'
import { DomainPayloadWrapper } from './Wrapper.ts'

export const DomainPayloadPlugin: PayloadPluginFunc<DomainPayload> = () => (createPayloadPlugin<DomainPayload>({
  schema: DomainSchema,
  template: domainConfigTemplate,
  wrap: (payload: Payload) => DomainPayloadWrapper.wrap(payload as DomainPayload),
}))
