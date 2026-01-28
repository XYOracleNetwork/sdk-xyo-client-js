import { asSchema, type Query } from '@xyo-network/payload-model'

export const ArchivistSnapshotQuerySchema = asSchema('network.xyo.query.archivist.snapshot', true)
export type ArchivistSnapshotQuerySchema = typeof ArchivistSnapshotQuerySchema

export type ArchivistSnapshotQuery = Query<{
  schema: ArchivistSnapshotQuerySchema
}>
