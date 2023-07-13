import { Query } from '@xyo-network/payload-model'

export type ArchivistClearQuerySchema = 'network.xyo.query.archivist.clear'
export const ArchivistClearQuerySchema: ArchivistClearQuerySchema = 'network.xyo.query.archivist.clear'

export type ArchivistClearQuery = Query<{
  schema: ArchivistClearQuerySchema
}>
