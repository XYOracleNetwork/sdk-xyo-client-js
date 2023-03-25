import { Query } from '@xyo-network/module-model'
import { PayloadFindFilter } from '@xyo-network/payload-model'

export type ArchivistFindQuerySchema = 'network.xyo.query.archivist.find'
export const ArchivistFindQuerySchema: ArchivistFindQuerySchema = 'network.xyo.query.archivist.find'

export type ArchivistFindQuery = Query<{
  filter?: PayloadFindFilter
  schema: ArchivistFindQuerySchema
}>
