import { Query } from '@xyo-network/module-model'

export type ArchivistDeleteQuerySchema = 'network.xyo.query.archivist.delete'
export const ArchivistDeleteQuerySchema: ArchivistDeleteQuerySchema = 'network.xyo.query.archivist.delete'

export type ArchivistDeleteQuery = Query<{
  hashes: string[]
  schema: ArchivistDeleteQuerySchema
}>
