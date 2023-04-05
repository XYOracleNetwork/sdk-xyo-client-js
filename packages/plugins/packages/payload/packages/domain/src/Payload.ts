import { XyoNetworkPayload } from '@xyo-network/network'
import { Payload } from '@xyo-network/payload-model'

import { XyoDomainSchema } from './Schema'

export interface XyoAlias {
  /** @field huri to the aliased payload */
  huri: string
  /** @field canonical name (ex. network.xyo.example) */
  name?: string
}

export type XyoDomainPayload = Payload<{
  /** @field Additional config files [huri] [out] */
  additional?: string[]
  /** @field Values associated with this domain [out] */
  aliases?: Record<string, XyoAlias>
  /** @field Known networks [out] */
  networks?: XyoNetworkPayload[]
  schema: XyoDomainSchema
}>
