import type { Hash } from '@xylabs/hex'

export interface NextOptions<TId = string> {
  limit?: number
  offset?: TId
  order?: 'asc' | 'desc'
}

export interface ArchivistNextOptions extends NextOptions<Hash> {}
