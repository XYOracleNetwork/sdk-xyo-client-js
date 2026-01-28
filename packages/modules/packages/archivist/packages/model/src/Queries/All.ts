import { asSchema, type Query } from '@xyo-network/payload-model'

export const ArchivistAllQuerySchema = asSchema('network.xyo.query.archivist.all', true)
export type ArchivistAllQuerySchema = typeof ArchivistAllQuerySchema

export type ArchivistAllQuery = Query<{
  schema: ArchivistAllQuerySchema
}>
