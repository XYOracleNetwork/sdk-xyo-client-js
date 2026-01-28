import { asSchema, type Payload } from '@xyo-network/payload-model'

import type { NetworkNodePayload } from './NetworkNodePayload.ts'

export const NetworkSchema = asSchema('network.xyo.network', true)
export type NetworkSchema = typeof NetworkSchema

export type NetworkPayload = Payload<{
  name?: string
  nodes?: NetworkNodePayload[]
  slug: string
}, NetworkSchema>
