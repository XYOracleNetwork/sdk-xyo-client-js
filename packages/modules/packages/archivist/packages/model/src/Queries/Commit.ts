import { asSchema, type Query } from '@xyo-network/payload-model'

export const ArchivistCommitQuerySchema = asSchema('network.xyo.query.archivist.commit', true)
export type ArchivistCommitQuerySchema = typeof ArchivistCommitQuerySchema

export type ArchivistCommitQuery = Query<{
  schema: ArchivistCommitQuerySchema
}>
