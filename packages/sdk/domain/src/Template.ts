import { XyoDomainPayload } from './DomainPayload'

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
          schema: 'network.xyo.node',
          slug: '',
          type: 'archivist',
          uri: '',
        },
      ],
      schema: 'network.xyo.network',
      slug: '',
    },
  ],
  schema: 'network.xyo.domain',
})
