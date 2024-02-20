import { Hash } from '@xylabs/hex'
import { Query } from '@xyo-network/payload-model'

export type ArchivistNextQuerySchema = 'network.xyo.query.archivist.next'
export const ArchivistNextQuerySchema: ArchivistNextQuerySchema = 'network.xyo.query.archivist.next'

export type ArchivistNextQuery = Query<{
  limit?: number
  previous?: Hash
  schema: ArchivistNextQuerySchema
}>
