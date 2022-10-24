import { XyoPayload } from '@xyo-network/payload'

export type XyoNetworkNodeType = 'archivist' | 'diviner' | 'bridge' | 'sentinel'

export type XyoNetworkNodeSchema = 'network.xyo.network.node'
export const XyoNetworkNodeSchema: XyoNetworkNodeSchema = 'network.xyo.network.node'

export type XyoNetworkNodePayload = XyoPayload<
  {
    docs?: string
    name?: string
    slug: string
    type: XyoNetworkNodeType
    uri: string
    web?: string
  },
  XyoNetworkNodeSchema
>

/** @deprecated use XyoNodePayload instead */
export type XyoNodeConfig = XyoNetworkNodePayload
