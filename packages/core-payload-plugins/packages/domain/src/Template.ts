import { asSchema } from '@xyo-network/payload-model'

import type { DomainPayload } from './Payload.ts'
import { DomainSchema } from './Schema.ts'

export const domainConfigTemplate = (): DomainPayload => ({
  aliases: { 'com.example.id': { huri: '' } },
  networks: [
    {
      name: '',
      nodes: [
        {
          name: '',
          schema: asSchema('network.xyo.network.node', true),
          slug: '',
          type: 'archivist',
          uri: '',
        },
      ],
      schema: asSchema('network.xyo.network', true),
      slug: '',
    },
  ],
  schema: DomainSchema,
})
