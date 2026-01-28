import type { Hash } from '@xylabs/sdk-js'
import { asSchema, type Query } from '@xyo-network/payload-model'

export const ArchivistGetQuerySchema = asSchema('network.xyo.query.archivist.get', true)
export type ArchivistGetQuerySchema = typeof ArchivistGetQuerySchema

export type ArchivistGetQuery = Query<{
  hashes: Hash[]
  schema: ArchivistGetQuerySchema
}>
