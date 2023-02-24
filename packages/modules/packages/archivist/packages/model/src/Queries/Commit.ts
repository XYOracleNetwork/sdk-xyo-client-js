import { XyoQuery } from '@xyo-network/module-model'

export type ArchivistCommitQuerySchema = 'network.xyo.query.archivist.commit'
export const ArchivistCommitQuerySchema: ArchivistCommitQuerySchema = 'network.xyo.query.archivist.commit'

export type ArchivistCommitQuery = XyoQuery<{
  schema: ArchivistCommitQuerySchema
}>
