import type { Payload } from '@xyo-network/payload-model'

import type { NetworkNodePayload } from './NetworkNodePayload.ts'

export const NetworkSchema = 'network.xyo.network' as const
export type NetworkSchema = typeof NetworkSchema

export type NetworkPayload = Payload<{
  name?: string
  nodes?: NetworkNodePayload[]
  slug: string
}, NetworkSchema>
