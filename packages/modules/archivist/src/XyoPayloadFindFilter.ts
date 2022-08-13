import { XyoQueryPayload } from '@xyo-network/payload'

export interface XyoPayloadFindFilter {
  order?: 'desc' | 'asc'
  timestamp?: number
  limit?: number
  schema?: string
}

export type XyoPayloadFindQuery = XyoQueryPayload<{
  schema: 'network.xyo.payload.query.find'
  filter: XyoPayloadFindFilter
}>
