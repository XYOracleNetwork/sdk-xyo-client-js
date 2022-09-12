import { XyoPayload } from '@xyo-network/payload'

import { XyoNetworkNodePayload } from './XyoNetworkNodePayload'

export type XyoNetworkSchema = 'network.xyo.network'
export const XyoNetworkSchema = 'network.xyo.network'

export type XyoNetworkPayload = XyoPayload<{
  schema: XyoNetworkSchema
  slug: string
  name?: string
  nodes?: XyoNetworkNodePayload[]
}>

/** @deprecated use XyoNetworkPayload instead */
export type XyoNetworkConfig = XyoNetworkPayload
