import { XyoNodeConfig } from '../shared'

export const knownDiviners: XyoNodeConfig[] = [
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
