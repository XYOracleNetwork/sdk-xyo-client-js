import { Query } from '@xyo-network/payload-model'

export const ArchivistAllQuerySchema = 'network.xyo.query.archivist.all' as const
export type ArchivistAllQuerySchema = typeof ArchivistAllQuerySchema

export type ArchivistAllQuery = Query<{
  schema: ArchivistAllQuerySchema
}>
