import type { Hash } from '@xylabs/hex'
import type { Query } from '@xyo-network/payload-model'

export const ArchivistDeleteQuerySchema = 'network.xyo.query.archivist.delete' as const
export type ArchivistDeleteQuerySchema = typeof ArchivistDeleteQuerySchema

export type ArchivistDeleteQuery = Query<{
  hashes: Hash[]
  schema: ArchivistDeleteQuerySchema
}>
