import { XyoQuery } from '@xyo-network/module'

export type XyoArchivistAllQuerySchema = 'network.xyo.query.archivist.all'
export const XyoArchivistAllQuerySchema: XyoArchivistAllQuerySchema = 'network.xyo.query.archivist.all'

export type XyoArchivistAllQuery = XyoQuery<{
  schema: XyoArchivistAllQuerySchema
}>
