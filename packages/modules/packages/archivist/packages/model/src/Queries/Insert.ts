import { asSchema, type Query } from '@xyo-network/payload-model'

export const ArchivistInsertQuerySchema = asSchema('network.xyo.query.archivist.insert', true)
export type ArchivistInsertQuerySchema = typeof ArchivistInsertQuerySchema

export type ArchivistInsertQuery = Query<{
  schema: ArchivistInsertQuerySchema
}>
