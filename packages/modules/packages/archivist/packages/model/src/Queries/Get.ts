import { Hash } from '@xylabs/hex'
import { Query } from '@xyo-network/payload-model'

export type ArchivistGetQuerySchema = 'network.xyo.query.archivist.get'
export const ArchivistGetQuerySchema: ArchivistGetQuerySchema = 'network.xyo.query.archivist.get'

export type ArchivistGetQuery = Query<{
  hashes: Hash[]
  schema: ArchivistGetQuerySchema
}>
