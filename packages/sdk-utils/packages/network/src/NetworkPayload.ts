import { Payload } from '@xyo-network/payload-model'

import { NetworkNodePayload } from './NetworkNodePayload'

export type NetworkSchema = 'network.xyo.network'
export const NetworkSchema = 'network.xyo.network'

export type NetworkPayload = Payload<{
  name?: string
  nodes?: NetworkNodePayload[]
  schema: NetworkSchema
  slug: string
}>
