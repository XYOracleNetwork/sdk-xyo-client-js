import type { Query } from '@xyo-network/payload-model'

export const ArchivistSnapshotQuerySchema = 'network.xyo.query.archivist.snapshot' as const
export type ArchivistSnapshotQuerySchema = typeof ArchivistSnapshotQuerySchema

export type ArchivistSnapshotQuery = Query<{
  schema: ArchivistSnapshotQuerySchema
}>
