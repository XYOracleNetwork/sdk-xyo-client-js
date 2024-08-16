import type { Payload } from '@xyo-network/payload-model'

import type { NetworkNodePayload } from './NetworkNodePayload.ts'

export type NetworkSchema = 'network.xyo.network'
export const NetworkSchema = 'network.xyo.network'

export type NetworkPayload = Payload<{
  name?: string
  nodes?: NetworkNodePayload[]
  schema: NetworkSchema
  slug: string
}>
