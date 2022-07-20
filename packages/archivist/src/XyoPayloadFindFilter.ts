export interface XyoPayloadFindFilter {
  [key: string]: unknown
  order?: 'desc' | 'asc'
  timestamp?: number
  limit?: number
  schema?: string
}
