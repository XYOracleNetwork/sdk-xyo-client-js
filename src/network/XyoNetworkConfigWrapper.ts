import { assertEx } from '@xylabs/sdk-js'

import { knownNetworks } from './knownNetworks'
import { XyoNetworkConfig } from './XyoNetworkConfig'
import { XyoNodeType } from './XyoNodeConfig'

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
      knownNetworks.find((config) => config.slug === slug),
      'Unknown network'
    )
    return new XyoNetworkConfigWrapper(config)
  }
}
