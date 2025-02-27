import { Query } from '@xyo-network/payload-model'

export const ArchivistCommitQuerySchema = 'network.xyo.query.archivist.commit' as const
export type ArchivistCommitQuerySchema = typeof ArchivistCommitQuerySchema

export type ArchivistCommitQuery = Query<{
  schema: ArchivistCommitQuerySchema
}>
