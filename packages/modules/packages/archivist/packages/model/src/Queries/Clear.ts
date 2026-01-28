import { asSchema, type Query } from '@xyo-network/payload-model'

export const ArchivistClearQuerySchema = asSchema('network.xyo.query.archivist.clear', true)
export type ArchivistClearQuerySchema = typeof ArchivistClearQuerySchema

export type ArchivistClearQuery = Query<{
  schema: ArchivistClearQuerySchema
}>
