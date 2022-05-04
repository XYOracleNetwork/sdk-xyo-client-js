import { XyoNodeConfig } from '../shared'

export const knownArchivists: XyoNodeConfig[] = [
  {
    docs: 'https://beta.archivist.xyo.network/api',
    name: 'XYO Shared Archivist (kerplunk)',
    slug: 'kerplunk-archivist-xyo-network',
    type: 'archivist',
    uri: 'https://beta.api.archivist.xyo.network',
    web: 'https://beta.archivist.xyo.network',
  },
  {
    docs: 'https://archivist.xyo.network/api',
    name: 'XYO Shared Archivist (main)',
    slug: 'main-archivist-xyo-network',
    type: 'archivist',
    uri: 'https://api.archivist.xyo.network',
    web: 'https://archivist.xyo.network',
  },
  {
    docs: 'http://localhost:8080/api',
    name: 'XYO Shared Archivist (local)',
    slug: 'local-archivist-xyo-network',
    type: 'archivist',
    uri: 'http://localhost:8080',
    web: 'http://localhost:8081',
  },
]
