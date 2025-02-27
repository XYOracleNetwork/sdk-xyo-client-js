import { Hash } from '@xylabs/hex'
import { Query } from '@xyo-network/payload-model'

export const ArchivistDeleteQuerySchema = 'network.xyo.query.archivist.delete' as const
export type ArchivistDeleteQuerySchema = typeof ArchivistDeleteQuerySchema

export type ArchivistDeleteQuery = Query<{
  hashes: Hash[]
  schema: ArchivistDeleteQuerySchema
}>
