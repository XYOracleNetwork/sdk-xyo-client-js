import type { Hash } from '@xylabs/hex'
import type { Query } from '@xyo-network/payload-model'

export type ArchivistDeleteQuerySchema = 'network.xyo.query.archivist.delete'
export const ArchivistDeleteQuerySchema: ArchivistDeleteQuerySchema = 'network.xyo.query.archivist.delete'

export type ArchivistDeleteQuery = Query<{
  hashes: Hash[]
  schema: ArchivistDeleteQuerySchema
}>
