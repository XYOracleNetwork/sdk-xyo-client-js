import { assertEx } from '@xylabs/sdk-js'

import { XyoNetworkConfig } from './XyoNetworkConfig'
import { XyoNodeConfig, XyoNodeType } from './XyoNodeConfig'
import { XyoNodeConfigWrapper } from './XyoNodeConfigWrapper'

const knownNetworkConfigs: XyoNetworkConfig[] = [
  {
    name: 'Kerplunk',
    nodes: [XyoNodeConfigWrapper.known('kerplunk-archivist-xyo-network')?.config, XyoNodeConfigWrapper.known('beta-location-diviner-xyo-network')?.config].filter(
      (item) => item
    ) as XyoNodeConfig[],
    slug: 'kerplunk',
  },
  {
    name: 'Main',
    nodes: [XyoNodeConfigWrapper.known('main-archivist-xyo-network')?.config, XyoNodeConfigWrapper.known('location-diviner-xyo-network')?.config].filter(
      (item) => item
    ) as XyoNodeConfig[],
    slug: 'main',
  },
  {
    name: 'Local',
    nodes: [XyoNodeConfigWrapper.known('kerplunk-archivist-xyo-network')?.config, XyoNodeConfigWrapper.known('beta-location-diviner-xyo-network')?.config].filter(
      (item) => item
    ) as XyoNodeConfig[],
    slug: 'local',
  },
]

export class XyoNetworkConfigWrapper {
  public config: XyoNetworkConfig

  constructor(config: XyoNetworkConfig) {
    this.config = config
  }

  public filterNodesByType(type: XyoNodeType) {
    return this.config.nodes.filter((node) => node.type === type)
  }

  public get archivists() {
    return this.filterNodesByType('archivist')
  }

  public get diviners() {
    return this.filterNodesByType('diviner')
  }

  public get bridges() {
    return this.filterNodesByType('bridge')
  }

  public get sentinels() {
    return this.filterNodesByType('sentinel')
  }

  static known(slug: string) {
    const config = assertEx(
      knownNetworkConfigs.find((config) => config.slug === slug),
      'Unknown network'
    )
    return new XyoNetworkConfigWrapper(config)
  }
}
