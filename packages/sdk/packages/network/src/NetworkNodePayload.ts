import { Payload } from '@xyo-network/payload-model'

export type NetworkNodeType = 'archivist' | 'diviner' | 'bridge' | 'sentinel'

export type NetworkNodeSchema = 'network.xyo.network.node'
export const NetworkNodeSchema: NetworkNodeSchema = 'network.xyo.network.node'

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
