import { XyoQuery } from '@xyo-network/module-model'

export type ArchivistInsertQuerySchema = 'network.xyo.query.archivist.insert'
export const ArchivistInsertQuerySchema: ArchivistInsertQuerySchema = 'network.xyo.query.archivist.insert'

export type ArchivistInsertQuery = XyoQuery<{
  payloads: string[]
  schema: ArchivistInsertQuerySchema
}>
