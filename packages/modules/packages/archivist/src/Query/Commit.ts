import { XyoQueryPayload } from '@xyo-network/module'

export type XyoArchivistCommitQueryPayloadSchema = 'network.xyo.query.archivist.commit'
export const XyoArchivistCommitQueryPayloadSchema: XyoArchivistCommitQueryPayloadSchema = 'network.xyo.query.archivist.commit'

export type XyoArchivistCommitQueryPayload = XyoQueryPayload<{
  schema: XyoArchivistCommitQueryPayloadSchema
}>
