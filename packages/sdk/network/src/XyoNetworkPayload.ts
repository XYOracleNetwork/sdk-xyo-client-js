import { XyoPayload } from '@xyo-network/payload'

import { XyoNetworkNodePayload } from './XyoNetworkNodePayload'

export type XyoNetworkPayload = XyoPayload<{
  schema: 'network.xyo.network'
  slug: string
  name?: string
  nodes?: XyoNetworkNodePayload[]
}>

/** @deprecated use XyoNetworkPayload instead */
export type XyoNetworkConfig = XyoNetworkPayload
