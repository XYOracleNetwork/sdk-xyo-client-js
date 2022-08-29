import { XyoPayload } from '@xyo-network/payload'

import { XyoNetworkNodePayload } from './XyoNetworkNodePayload'

export type XyoNetworkPayloadSchema = 'network.xyo.network'
export const XyoNetworkPayloadSchema = 'network.xyo.network'

export type XyoNetworkPayload = XyoPayload<{
  schema: XyoNetworkPayloadSchema
  slug: string
  name?: string
  nodes?: XyoNetworkNodePayload[]
}>

/** @deprecated use XyoNetworkPayload instead */
export type XyoNetworkConfig = XyoNetworkPayload
