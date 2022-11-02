import { XyoQuery } from '@xyo-network/module'

export type XyoArchivistGetQuerySchema = 'network.xyo.query.archivist.get'
export const XyoArchivistGetQuerySchema: XyoArchivistGetQuerySchema = 'network.xyo.query.archivist.get'

export type XyoArchivistGetQuery = XyoQuery<{
  hashes: string[]
  schema: XyoArchivistGetQuerySchema
}>
