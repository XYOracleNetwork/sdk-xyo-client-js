import { XyoNetworkPayload } from '@xyo-network/network'
import { XyoPayload } from '@xyo-network/payload'

import { XyoDomainPayloadSchema } from './Schema'

export interface XyoAlias {
  /** @field cononical name (ex. network.xyo.example) */
  name?: string
  /** @field huri to the aliased payload */
  huri: string
}

export type XyoDomainPayload = XyoPayload<{
  schema: XyoDomainPayloadSchema
  /** @field Values associated with this domain [out] */
  aliases?: Record<string, XyoAlias>
  /** @field Additional config files [huri] [out] */
  additional?: string[]
  /** @field Known networks [out] */
  networks?: XyoNetworkPayload[]
}>

/** @deprecated use XyoDomainPayload instead */
export type XyoDomainConfig = XyoDomainPayload
