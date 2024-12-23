import type { Hash, Hex } from '@xylabs/hex'

export interface NextOptions<TId = Hex> {
  cursor?: TId
  limit?: number
  order?: 'asc' | 'desc'
}

export interface ArchivistNextOptions extends NextOptions<Hash> {}
