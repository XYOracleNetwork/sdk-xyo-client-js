import { NetworkPayload } from '@xyo-network/network'
import { Payload } from '@xyo-network/payload-model'

import { DomainSchema } from './Schema'

export interface Alias {
  /** @field huri to the aliased payload */
  huri: string
  /** @field canonical name (ex. network.xyo.example) */
  name?: string
}

export type DomainPayload = Payload<{
  /** @field Additional config files [huri] [out] */
  additional?: string[]
  /** @field Values associated with this domain [out] */
  aliases?: Record<string, Alias>
  /** @field Known networks [out] */
  networks?: NetworkPayload[]
  schema: DomainSchema
}>
