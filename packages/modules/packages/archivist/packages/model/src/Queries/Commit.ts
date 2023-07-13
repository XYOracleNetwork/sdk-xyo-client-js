import { Query } from '@xyo-network/payload-model'

export type ArchivistCommitQuerySchema = 'network.xyo.query.archivist.commit'
export const ArchivistCommitQuerySchema: ArchivistCommitQuerySchema = 'network.xyo.query.archivist.commit'

export type ArchivistCommitQuery = Query<{
  schema: ArchivistCommitQuerySchema
}>
