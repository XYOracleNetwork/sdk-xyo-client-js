import type { Query } from '@xyo-network/payload-model'

export type ArchivistInsertQuerySchema = 'network.xyo.query.archivist.insert'
export const ArchivistInsertQuerySchema: ArchivistInsertQuerySchema = 'network.xyo.query.archivist.insert'

export type ArchivistInsertQuery = Query<{
  schema: ArchivistInsertQuerySchema
}>
