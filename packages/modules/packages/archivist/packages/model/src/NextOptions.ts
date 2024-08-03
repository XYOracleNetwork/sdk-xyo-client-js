import { Hash } from '@xylabs/hex'

export interface NextOptions<TId = string> {
  limit?: number
  offset?: TId
  order?: 'asc' | 'desc'
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ArchivistNextOptions extends NextOptions<Hash> {}
