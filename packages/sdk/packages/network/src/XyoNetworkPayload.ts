import { XyoPayload } from '@xyo-network/payload-model'

import { XyoNetworkNodePayload } from './XyoNetworkNodePayload'

export type XyoNetworkSchema = 'network.xyo.network'
export const XyoNetworkSchema = 'network.xyo.network'

export type XyoNetworkPayload = XyoPayload<{
  name?: string
  nodes?: XyoNetworkNodePayload[]
  schema: XyoNetworkSchema
  slug: string
}>
