import { XyoPayload } from '@xyo-network/core'

import { XyoNetworkNodePayload } from './XyoNetworkNodePayload'

export interface XyoNetworkPayload extends XyoPayload {
  /** @deprecated use hash of the payload instead */
  slug?: string
  name?: string
  nodes?: XyoNetworkNodePayload[]
}

/** @deprecated use XyoNetworkPayload instead */
export type XyoNetworkConfig = XyoNetworkPayload
