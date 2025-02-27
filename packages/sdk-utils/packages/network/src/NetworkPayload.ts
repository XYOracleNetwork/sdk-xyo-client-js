import { Payload } from '@xyo-network/payload-model'

import { NetworkNodePayload } from './NetworkNodePayload.ts'

export const NetworkSchema = 'network.xyo.network' as const
export type NetworkSchema = typeof NetworkSchema

export type NetworkPayload = Payload<{
  name?: string
  nodes?: NetworkNodePayload[]
  schema: NetworkSchema
  slug: string
}>
