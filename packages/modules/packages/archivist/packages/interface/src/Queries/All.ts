import { XyoQuery } from '@xyo-network/module-model'

export type ArchivistAllQuerySchema = 'network.xyo.query.archivist.all'
export const ArchivistAllQuerySchema: ArchivistAllQuerySchema = 'network.xyo.query.archivist.all'

export type ArchivistAllQuery = XyoQuery<{
  schema: ArchivistAllQuerySchema
}>
