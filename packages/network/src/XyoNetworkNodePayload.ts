import { XyoPayload } from '@xyo-network/core'

export type XyoNetworkNodeType = 'archivist' | 'diviner' | 'bridge' | 'sentinel'

export interface XyoNetworkNodePayload extends XyoPayload {
  type: XyoNetworkNodeType
  slug: string
  name?: string
  uri: string
  web?: string
  docs?: string
}

/** @deprecated use XyoNodePayload instead */
export type XyoNodeConfig = XyoNetworkNodePayload
