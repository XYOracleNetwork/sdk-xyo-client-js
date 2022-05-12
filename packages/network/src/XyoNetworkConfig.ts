import { XyoNodeConfig } from './XyoNodeConfig'

export interface XyoNetworkConfig {
  slug: string
  name: string
  nodes: XyoNodeConfig[]
}
