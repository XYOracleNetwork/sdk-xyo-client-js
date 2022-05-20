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
          type: 'archivist',
          uri: '',
        },
      ],
      schema: 'network.xyo.network',
    },
  ],
  schema: 'network.xyo.domain',
})
