import type { NetworkPayload } from '@xyo-network/network'
import { isPayloadOfSchemaType, type Payload } from '@xyo-network/payload-model'

import { DomainSchema } from './Schema.ts'

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
}, DomainSchema>

export const isDomainPayload = isPayloadOfSchemaType<DomainPayload>(DomainSchema)
