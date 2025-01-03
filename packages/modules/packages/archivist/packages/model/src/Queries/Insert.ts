import type { Query } from '@xyo-network/payload-model'

export const ArchivistInsertQuerySchema = 'network.xyo.query.archivist.insert' as const
export type ArchivistInsertQuerySchema = typeof ArchivistInsertQuerySchema

export type ArchivistInsertQuery = Query<{
  schema: ArchivistInsertQuerySchema
}>
