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
          schema: 'network.xyo.network.node',
          slug: '',
          type: 'archivist',
          uri: '',
        },
      ],
      schema: 'network.xyo.network',
      slug: '',
    },
  ],
  schema: DomainSchema,
})
