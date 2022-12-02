import { XyoQuery } from '@xyo-network/module'

export type XyoArchivistInsertQuerySchema = 'network.xyo.query.archivist.insert'
export const XyoArchivistInsertQuerySchema: XyoArchivistInsertQuerySchema = 'network.xyo.query.archivist.insert'

export type XyoArchivistInsertQuery = XyoQuery<{
  payloads: string[]
  schema: XyoArchivistInsertQuerySchema
}>
