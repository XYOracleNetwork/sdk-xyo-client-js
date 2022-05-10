import { XyoDomainConfig } from './DomainConfig'

export const domainConfigTemplate = (): XyoDomainConfig => ({
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
          slug: '',
          type: 'archivist',
          uri: '',
        },
      ],
      slug: '',
    },
  ],
  schema: 'network.xyo.domain',
})
