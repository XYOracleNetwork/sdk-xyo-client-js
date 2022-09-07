import { XyoQuery } from '@xyo-network/module'

export type XyoArchivistClearQuerySchema = 'network.xyo.query.archivist.clear'
export const XyoArchivistClearQuerySchema: XyoArchivistClearQuerySchema = 'network.xyo.query.archivist.clear'

export type XyoArchivistClearQuery = XyoQuery<{
  schema: XyoArchivistClearQuerySchema
}>
