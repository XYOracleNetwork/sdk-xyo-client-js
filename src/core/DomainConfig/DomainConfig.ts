import axios from 'axios'
import reverse from 'lodash/reverse'

export interface XyoNodeConfig {
  /** @field The type of the node [out] */
  type: 'archivist' | 'diviner' | 'bridge' | 'sentinel'
  slug: string
  name: string
  urls: {
    api: string
    web?: string
  }
}

export interface XyoNetworkConfig {
  slug: string
  name: string
  nodes: XyoNodeConfig[]
}

export interface XyoDomainConfig {
  /** @field Domain associated with this config [in/out] */
  domain?: string
  /** @field Schemas associated with this domain [out] */
  schema?: Record<string, string>
  /** @field Additional config files [uri or hashes] [out] */
  additional?: string[]
  /** @field Known networks [out] */
  networks?: XyoNetworkConfig[]
}

export class XyoDomainConfigWrapper implements XyoDomainConfig {
  constructor(config: XyoDomainConfig) {
    this.domain = config.domain
    this.schema = config.schema
    this.additional = config.additional
    this.networks = config.networks
  }

  domain?: string
  /** @field Schemas associated with this domain [out] */
  schema?: Record<string, string>
  /** @field Additional config files [uri, huri or hashes] [out] */
  additional?: string[]
  /** @field Known networks [out] */
  networks?: XyoNetworkConfig[]

  public static async discover(reverseDomainName: string) {
    const parts = reverseDomainName.split('.')
    for (let i = 2; i <= parts.length; i++) {
      const domainToCheck = reverse(parts.filter((_, index) => index < i)).join('.')
      try {
        const config = (await axios.get<XyoDomainConfig>(`https://${domainToCheck}/xyo-config.json`)).data
        return new XyoDomainConfigWrapper(config)
      } catch (ex) {
        console.log(`XyoDomainConfig not found [${domainToCheck}]`)
      }
    }
  }
}
