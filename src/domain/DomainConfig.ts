import { XyoPayload } from '../core'

export type XyoNodeType = 'archivist' | 'diviner' | 'bridge' | 'sentinel'

export interface XyoNodeConfig {
  type: XyoNodeType
  slug: string
  name: string
  uri: string
}

export interface XyoNetworkConfig {
  slug: string
  name: string
  nodes: XyoNodeConfig[]
}

export interface XyoAlias {
  /** @field cononical name (ex. network.xyo.example) */
  name: string
  /** @field huri to the aliased payload */
  huri: string
}

export interface XyoDomainConfig extends XyoPayload {
  schema: 'network.xyo.domain'
  /** @field Domain associated with this config [in/out] */
  domain: string
  /** @field Values associated with this domain [out] */
  aliases?: XyoAlias[]
  /** @field Additional config files [huri] [out] */
  additional?: string[]
  /** @field Known networks [out] */
  networks?: XyoNetworkConfig[]
}
