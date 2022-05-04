import { XyoNetworkConfig } from './XyoNetworkConfig'
import { XyoNodeConfig } from './XyoNodeConfig'
import { XyoNodeConfigWrapper } from './XyoNodeConfigWrapper'

const kerplunk = (): XyoNetworkConfig => {
  return {
    name: 'Kerplunk',
    nodes: [XyoNodeConfigWrapper.known('kerplunk-archivist-xyo-network')?.config, XyoNodeConfigWrapper.known('beta-location-diviner-xyo-network')?.config].filter(
      (item) => item
    ) as XyoNodeConfig[],
    slug: 'kerplunk',
  }
}

const main = (): XyoNetworkConfig => {
  return {
    name: 'Main',
    nodes: [XyoNodeConfigWrapper.known('main-archivist-xyo-network')?.config, XyoNodeConfigWrapper.known('location-diviner-xyo-network')?.config].filter(
      (item) => item
    ) as XyoNodeConfig[],
    slug: 'main',
  }
}

const local = (): XyoNetworkConfig => {
  return {
    name: 'Local',
    nodes: [XyoNodeConfigWrapper.known('kerplunk-archivist-xyo-network')?.config, XyoNodeConfigWrapper.known('beta-location-diviner-xyo-network')?.config].filter(
      (item) => item
    ) as XyoNodeConfig[],
    slug: 'local',
  }
}

export const knownNetworks = (): XyoNetworkConfig[] => [kerplunk(), main(), local()]
