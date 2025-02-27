import { Payload } from '@xyo-network/payload-model'

export type NetworkNodeType = 'archivist' | 'diviner' | 'bridge' | 'sentinel'

export const NetworkNodeSchema = 'network.xyo.network.node' as const
export type NetworkNodeSchema = typeof NetworkNodeSchema

export type NetworkNodePayload = Payload<
  {
    docs?: string
    name?: string
    slug: string
    type: NetworkNodeType
    uri: string
    web?: string
  },
  NetworkNodeSchema
>
