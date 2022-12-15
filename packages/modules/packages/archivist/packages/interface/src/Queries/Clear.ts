import { XyoQuery } from '@xyo-network/module'

export type ArchivistClearQuerySchema = 'network.xyo.query.archivist.clear'
export const ArchivistClearQuerySchema: ArchivistClearQuerySchema = 'network.xyo.query.archivist.clear'

export type ArchivistClearQuery = XyoQuery<{
  schema: ArchivistClearQuerySchema
}>
