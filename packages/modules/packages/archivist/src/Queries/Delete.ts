import { XyoQuery } from '@xyo-network/module'

export type XyoArchivistDeleteQuerySchema = 'network.xyo.query.archivist.delete'
export const XyoArchivistDeleteQuerySchema: XyoArchivistDeleteQuerySchema = 'network.xyo.query.archivist.delete'

export type XyoArchivistDeleteQuery = XyoQuery<{
  schema: XyoArchivistDeleteQuerySchema
  hashes: string[]
}>
