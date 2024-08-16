import type { Hash } from '@xylabs/hex'
import type { Query } from '@xyo-network/payload-model'

export type ArchivistGetQuerySchema = 'network.xyo.query.archivist.get'
export const ArchivistGetQuerySchema: ArchivistGetQuerySchema = 'network.xyo.query.archivist.get'

export type ArchivistGetQuery = Query<{
  hashes: Hash[]
  schema: ArchivistGetQuerySchema
}>
