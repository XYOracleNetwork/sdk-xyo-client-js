import type { Hash } from '@xylabs/sdk-js'
import { asSchema, type Query } from '@xyo-network/payload-model'

export const ArchivistDeleteQuerySchema = asSchema('network.xyo.query.archivist.delete', true)
export type ArchivistDeleteQuerySchema = typeof ArchivistDeleteQuerySchema

export type ArchivistDeleteQuery = Query<{
  hashes: Hash[]
  schema: ArchivistDeleteQuerySchema
}>
