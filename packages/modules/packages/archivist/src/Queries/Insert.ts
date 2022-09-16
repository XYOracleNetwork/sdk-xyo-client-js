import { XyoQuery } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'

export type XyoArchivistInsertQuerySchema = 'network.xyo.query.archivist.insert'
export const XyoArchivistInsertQuerySchema: XyoArchivistInsertQuerySchema = 'network.xyo.query.archivist.insert'

export type XyoArchivistInsertQuery = XyoQuery<{
  schema: XyoArchivistInsertQuerySchema
  payloads: XyoPayload[]
}>
