import { Hash } from '@xylabs/hex'

export interface PayloadFindFilter {
  limit?: number
  offset?: Hash
  order?: 'desc' | 'asc'
  schema?: string | string[]
}
