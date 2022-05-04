import { XyoNodeConfig } from '../shared'

const beta = (): XyoNodeConfig => {
  return {
    name: 'XYO Location (beta)',
    slug: 'beta-location-diviner-xyo-network',
    type: 'diviner',
    uri: 'https://beta.api.location.diviner.xyo.network',
    web: 'https://beta.explore.xyo.network',
  }
}

const main = (): XyoNodeConfig => {
  return {
    name: 'XYO Location',
    slug: 'location-diviner-xyo-network',
    type: 'diviner',
    uri: 'https://api.location.diviner.xyo.network',
    web: 'https://explore.xyo.network',
  }
}

export const knownDiviners = (): XyoNodeConfig[] => [beta(), main()]
