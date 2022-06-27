import { XyoPayload } from '@xyo-network/payload'

import { XyoNetworkNodePayload } from './XyoNetworkNodePayload'

export interface XyoNetworkPayload extends XyoPayload {
  slug: string
  name?: string
  nodes?: XyoNetworkNodePayload[]
}

/** @deprecated use XyoNetworkPayload instead */
export type XyoNetworkConfig = XyoNetworkPayload
