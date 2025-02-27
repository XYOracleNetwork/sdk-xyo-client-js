import { Query } from '@xyo-network/payload-model'

export const ArchivistClearQuerySchema = 'network.xyo.query.archivist.clear' as const
export type ArchivistClearQuerySchema = typeof ArchivistClearQuerySchema

export type ArchivistClearQuery = Query<{
  schema: ArchivistClearQuerySchema
}>
