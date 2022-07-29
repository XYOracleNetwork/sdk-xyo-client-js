import { XyoPayload } from '@xyo-network/payload'

export type XyoNetworkNodeType = 'archivist' | 'diviner' | 'bridge' | 'sentinel'

export type XyoNetworkNodePayload = XyoPayload<{
  type: XyoNetworkNodeType
  slug: string
  name?: string
  uri: string
  web?: string
  docs?: string
}>

/** @deprecated use XyoNodePayload instead */
export type XyoNodeConfig = XyoNetworkNodePayload
