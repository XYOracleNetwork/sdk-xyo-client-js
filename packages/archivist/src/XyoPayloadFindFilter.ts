import { XyoQueryPayload } from '@xyo-network/payload'

export type XyoPayloadFindFilter = XyoQueryPayload<{
  order?: 'desc' | 'asc'
  timestamp?: number
  limit?: number
  schema?: string
}>
