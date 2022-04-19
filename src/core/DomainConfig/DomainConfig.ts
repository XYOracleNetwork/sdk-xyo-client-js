import { XyoPayload } from '../Payload'

export type XyoNodeType = 'archivist' | 'diviner' | 'bridge' | 'sentinel'

export interface XyoNodeConfig {
  /** @field The type of the node [out] */
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

export interface XyoDomainConfig extends XyoPayload {
  schema: 'network.xyo.domain'
  /** @field Domain associated with this config [in/out] */
  domain: string
  /** @field Schemas associated with this domain [out] */
  definitions?: string[]
  /** @field Additional config files [uri or hashes] [out] */
  additional?: string[]
  /** @field Known networks [out] */
  networks?: XyoNetworkConfig[]
}
