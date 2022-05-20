import { XyoPayload } from '@xyo-network/core'

import { XyoNetworkNodePayload } from './XyoNetworkNodePayload'

export interface XyoNetworkPayload extends XyoPayload {
  slug: string
  name?: string
  nodes?: XyoNetworkNodePayload[]
}

/** @deprecated use XyoNetworkPayload instead */
export type XyoNetworkConfig = XyoNetworkPayload
