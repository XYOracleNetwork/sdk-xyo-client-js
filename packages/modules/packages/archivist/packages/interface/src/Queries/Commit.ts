import { XyoQuery } from '@xyo-network/module'

export type XyoArchivistCommitQuerySchema = 'network.xyo.query.archivist.commit'
export const XyoArchivistCommitQuerySchema: XyoArchivistCommitQuerySchema = 'network.xyo.query.archivist.commit'

export type XyoArchivistCommitQuery = XyoQuery<{
  schema: XyoArchivistCommitQuerySchema
}>
