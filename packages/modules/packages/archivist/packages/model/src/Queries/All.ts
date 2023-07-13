import { Query } from '@xyo-network/payload-model'

export type ArchivistAllQuerySchema = 'network.xyo.query.archivist.all'
export const ArchivistAllQuerySchema: ArchivistAllQuerySchema = 'network.xyo.query.archivist.all'

export type ArchivistAllQuery = Query<{
  schema: ArchivistAllQuerySchema
}>
