import { assertEx } from '@xylabs/sdk-js'

import { XyoNodeConfig } from '../shared'

const knownArchivists: XyoNodeConfig[] = [
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

const knownDiviners: XyoNodeConfig[] = [
  {
    name: 'XYO Location (beta)',
    slug: 'beta-location-diviner-xyo-network',
    type: 'diviner',
    uri: 'https://beta.api.location.diviner.xyo.network',
    web: 'https://beta.explore.xyo.network',
  },
  {
    name: 'XYO Location',
    slug: 'location-diviner-xyo-network',
    type: 'diviner',
    uri: 'https://api.location.diviner.xyo.network',
    web: 'https://explore.xyo.network',
  },
]

export class XyoNodeConfigWrapper {
  public config: XyoNodeConfig

  constructor(config: XyoNodeConfig) {
    this.config = config
  }

  static known(slug: string) {
    const config = assertEx(knownArchivists.find((config) => config.slug === slug) ?? knownDiviners.find((config) => config.slug === slug), 'Unknown node')
    return new XyoNodeConfigWrapper(config)
  }
}
