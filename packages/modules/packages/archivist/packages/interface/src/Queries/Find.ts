import { XyoQuery } from '@xyo-network/module'
import { PayloadFindFilter } from '@xyo-network/payload'

export type ArchivistFindQuerySchema = 'network.xyo.query.archivist.find'
export const ArchivistFindQuerySchema: ArchivistFindQuerySchema = 'network.xyo.query.archivist.find'

export type ArchivistFindQuery = XyoQuery<{
  filter?: PayloadFindFilter
  schema: ArchivistFindQuerySchema
}>
