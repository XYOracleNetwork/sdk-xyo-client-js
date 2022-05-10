import { XyoPayload } from '../core'
import { XyoNetworkConfig } from '../network'

export interface XyoAlias {
  /** @field cononical name (ex. network.xyo.example) */
  name?: string
  /** @field huri to the aliased payload */
  huri: string
}

export interface XyoDomainConfig extends XyoPayload {
  schema: 'network.xyo.domain'
  /** @field Values associated with this domain [out] */
  aliases?: Record<string, XyoAlias>
  /** @field Additional config files [huri] [out] */
  additional?: string[]
  /** @field Known networks [out] */
  networks?: XyoNetworkConfig[]
}
