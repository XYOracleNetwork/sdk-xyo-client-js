import { XyoDomainPayload } from './Payload'
import { XyoDomainSchema } from './Schema'

export const domainConfigTemplate = (): XyoDomainPayload => ({
  aliases: {
    'com.example.id': {
      huri: '',
    },
  },
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
  schema: XyoDomainSchema,
})
